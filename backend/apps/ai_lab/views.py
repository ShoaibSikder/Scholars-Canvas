import html
import itertools
import mimetypes
import tempfile
from pathlib import Path
from types import SimpleNamespace

from django.http import FileResponse, Http404, HttpResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.resources.models import VaultResource
from apps.administration.models import AIUsageLog
from apps.administration.utils import bool_setting, setting_value

from .services import (
    answer_question,
    extract_document_text,
    extract_document_text_from_bytes,
    generate_flashcards_with_source,
    generate_multiple_choice_quiz_with_source,
    generate_summary_with_source,
)
from .preview import can_render_html_preview, get_office_pdf_preview_path, render_html_preview


TEMP_AI_DOCUMENTS = {}
TEMP_AI_DOCUMENT_IDS = itertools.count(1)


def user_temp_documents(request):
    return TEMP_AI_DOCUMENTS.setdefault(request.user.pk, {})


def clear_user_temp_documents(request):
    TEMP_AI_DOCUMENTS.pop(request.user.pk, None)


def make_temp_document(
    owner,
    title,
    course,
    file_name,
    extracted_text,
    source_resource=None,
    file_bytes=None,
    file_content_type="",
    source_file_path="",
):
    now = timezone.now().isoformat()
    return SimpleNamespace(
        id=next(TEMP_AI_DOCUMENT_IDS),
        owner_id=owner.pk,
        source_resource=source_resource,
        title=title,
        course=course,
        file_name=file_name,
        file_bytes=file_bytes,
        file_content_type=file_content_type,
        source_file_path=source_file_path,
        extracted_text=extracted_text,
        summary_data=[],
        summary_source="",
        flashcards=[],
        flashcards_source="",
        quiz_data=[],
        quiz_source="",
        chat_history=[],
        created_at=now,
        updated_at=now,
        ai_processing_allowed=True,
    )


def ai_allowed_response(request, feature):
    if not bool_setting("ai_features_enabled", True) or not request.user.ai_features_enabled:
        AIUsageLog.objects.create(user=request.user, feature=feature, status=AIUsageLog.Status.BLOCKED)
        return Response({"message": "You cannot use AI because an admin turned off AI access for your account."}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()
    daily_limit = request.user.daily_ai_limit
    monthly_limit = request.user.monthly_ai_limit
    if daily_limit:
        today_count = AIUsageLog.objects.filter(user=request.user, created_at__date=now.date()).count()
        if today_count >= daily_limit:
            AIUsageLog.objects.create(user=request.user, feature=feature, status=AIUsageLog.Status.BLOCKED)
            return Response({"message": "Daily AI usage limit reached."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    if monthly_limit:
        month_count = AIUsageLog.objects.filter(user=request.user, created_at__year=now.year, created_at__month=now.month).count()
        if month_count >= monthly_limit:
            AIUsageLog.objects.create(user=request.user, feature=feature, status=AIUsageLog.Status.BLOCKED)
            return Response({"message": "Monthly AI usage limit reached."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    return None


def ai_file_type_allowed(file_name):
    allowed = setting_value("allowed_ai_file_extensions", [".pdf", ".docx", ".pptx", ".txt", ".md", ".csv"])
    if isinstance(allowed, str):
        allowed = [item.strip() for item in allowed.split(",") if item.strip()]
    extension = Path(file_name).suffix.lower()
    return not allowed or extension in {item.lower() for item in allowed}


def log_ai_usage(request, feature, source="", error_message=""):
    AIUsageLog.objects.create(
        user=request.user,
        feature=feature,
        status=AIUsageLog.Status.FAILED if error_message else AIUsageLog.Status.SUCCESS,
        error_message=error_message,
        provider=source,
    )


def touch_temp_document(document):
    document.updated_at = timezone.now().isoformat()


def get_temp_document(request, pk):
    document = user_temp_documents(request).get(int(pk))
    if not document:
        raise Http404("Temporary AI Lab document not found.")
    return document


def serialize_document(document, request):
    preview_url = reverse("ai-lab-document-preview", kwargs={"pk": document.id})
    if request:
        preview_url = request.build_absolute_uri(preview_url)

    return {
        "id": document.id,
        "source_resource": getattr(document.source_resource, "pk", None),
        "title": document.title,
        "course": document.course,
        "file": "",
        "file_url": "",
        "file_name": document.file_name,
        "preview_url": preview_url,
        "text_preview": (document.extracted_text or "")[:12000],
        "summary_data": document.summary_data,
        "summary_source": document.summary_source,
        "flashcards": document.flashcards,
        "flashcards_source": document.flashcards_source,
        "quiz_data": document.quiz_data,
        "quiz_source": document.quiz_source,
        "chat_history": document.chat_history,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
    }


def temp_document_preview_html(document):
    title = html.escape(document.title or document.file_name or "AI Lab document")
    content = html.escape(document.extracted_text or "No readable text was extracted from this file.")
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        f"<title>{title}</title>"
        "<style>"
        "body{margin:0;background:#f8fafc;color:#334155;font-family:Inter,Segoe UI,Arial,sans-serif;}"
        "main{max-width:920px;margin:0 auto;padding:24px;}"
        "h1{font-size:20px;color:#0f172a;margin:0 0 16px;font-weight:800;}"
        "pre{white-space:pre-wrap;line-height:1.65;font-size:14px;background:white;border:1px solid #e2e8f0;border-radius:14px;padding:18px;}"
        "</style></head><body><main>"
        f"<h1>{title}</h1><pre>{content}</pre>"
        "</main></body></html>"
    )


def preview_response_from_path(document, file_path):
    path = Path(file_path)
    pdf_preview_path = get_office_pdf_preview_path(path)
    if pdf_preview_path:
        response = FileResponse(open(pdf_preview_path, "rb"), content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="{document.title or path.stem}.pdf"'
        response.headers.pop("X-Frame-Options", None)
        return response

    if can_render_html_preview(path):
        response = HttpResponse(
            render_html_preview(path, title=document.title),
            content_type="text/html; charset=utf-8",
        )
        response["Content-Disposition"] = f'inline; filename="{document.title or path.stem}.html"'
    else:
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        response = FileResponse(open(path, "rb"), content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{path.name}"'

    response.headers.pop("X-Frame-Options", None)
    return response


def preview_response_from_bytes(document):
    file_bytes = document.file_bytes or b""
    file_name = document.file_name or "ai-lab-file"
    suffix = Path(file_name).suffix.lower()

    temp_path = ""
    if suffix:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            pdf_preview_path = get_office_pdf_preview_path(temp_path)
            if pdf_preview_path:
                response = FileResponse(open(pdf_preview_path, "rb"), content_type="application/pdf")
                response["Content-Disposition"] = f'inline; filename="{document.title or Path(file_name).stem}.pdf"'
                response.headers.pop("X-Frame-Options", None)
                return response

            if not can_render_html_preview(temp_path):
                raise ValueError("HTML preview is not available for this file type.")

            response = HttpResponse(
                render_html_preview(temp_path, title=document.title),
                content_type="text/html; charset=utf-8",
            )
            response["Content-Disposition"] = f'inline; filename="{document.title or Path(file_name).stem}.html"'
            response.headers.pop("X-Frame-Options", None)
            return response
        except Exception:
            pass
        finally:
            if temp_path:
                Path(temp_path).unlink(missing_ok=True)

    content_type = document.file_content_type or mimetypes.guess_type(file_name)[0] or "application/octet-stream"
    response = HttpResponse(file_bytes, content_type=content_type)
    response["Content-Disposition"] = f'inline; filename="{file_name}"'
    response.headers.pop("X-Frame-Options", None)
    return response


class AIStudyDocumentCollectionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        clear_user_temp_documents(request)
        return Response({"documents": [], "active_document": None})

    def post(self, request):
        blocked = ai_allowed_response(request, "upload")
        if blocked:
            return blocked
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"message": "Please choose a file."}, status=status.HTTP_400_BAD_REQUEST)
        if not ai_file_type_allowed(uploaded_file.name):
            return Response({"message": "This file type is not allowed for AI processing."}, status=status.HTTP_400_BAD_REQUEST)

        title = (request.data.get("title") or Path(uploaded_file.name).stem).strip()
        course = (request.data.get("course") or "").strip()
        if hasattr(uploaded_file, "chunks"):
            file_bytes = b"".join(chunk for chunk in uploaded_file.chunks())
        else:
            file_bytes = uploaded_file.read()
        file_name = Path(uploaded_file.name).name
        extracted_text = extract_document_text_from_bytes(file_bytes, file_name)

        document = make_temp_document(
            owner=request.user,
            title=title,
            course=course,
            file_name=file_name,
            file_bytes=file_bytes,
            file_content_type=getattr(uploaded_file, "content_type", "") or mimetypes.guess_type(file_name)[0] or "",
            extracted_text=extracted_text,
        )
        user_temp_documents(request)[document.id] = document

        return Response(
            {
                "message": "Document opened temporarily in AI Lab.",
                "document": serialize_document(document, request),
            },
            status=status.HTTP_201_CREATED,
        )


class AIStudyVaultImportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        blocked = ai_allowed_response(request, "vault_import")
        if blocked:
            return blocked
        resource_id = request.data.get("resource_id")
        resource = VaultResource.objects.filter(pk=resource_id, course__user=request.user).select_related("course").first()

        if not resource:
            return Response({"message": "Vault file not found."}, status=status.HTTP_404_NOT_FOUND)
        if not resource.file:
            return Response({"message": "Only uploaded Vault files can be opened in AI Lab."}, status=status.HTTP_400_BAD_REQUEST)
        if not ai_file_type_allowed(resource.file.name):
            return Response({"message": "This file type is not allowed for AI processing."}, status=status.HTTP_400_BAD_REQUEST)

        course = resource.course
        document = make_temp_document(
            owner=request.user,
            source_resource=resource,
            title=resource.title,
            course=f"{course.code} - {course.title}",
            file_name=Path(resource.file.name).name,
            source_file_path=resource.file.path,
            extracted_text=extract_document_text(resource.file.path),
        )
        user_temp_documents(request)[document.id] = document

        return Response(
            {
                "message": "Vault file opened temporarily in AI Lab.",
                "document": serialize_document(document, request),
            },
            status=status.HTTP_201_CREATED,
        )


class AIStudyDocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request, pk):
        return Response(serialize_document(get_temp_document(request, pk), request))

    def patch(self, request, pk):
        document = get_temp_document(request, pk)
        if "title" in request.data:
            document.title = str(request.data.get("title") or document.title).strip()
        if "course" in request.data:
            document.course = str(request.data.get("course") or "").strip()
        touch_temp_document(document)
        return Response({"message": "Document updated for this session.", "document": serialize_document(document, request)})

    def delete(self, request, pk):
        user_temp_documents(request).pop(int(pk), None)
        return Response({"message": "Temporary document removed."})


@method_decorator(xframe_options_exempt, name="dispatch")
class AIStudyDocumentPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        document = get_temp_document(request, pk)
        if document.source_file_path:
            return preview_response_from_path(document, document.source_file_path)
        if document.file_bytes:
            return preview_response_from_bytes(document)

        response = HttpResponse(temp_document_preview_html(document), content_type="text/html; charset=utf-8")
        response["Content-Disposition"] = f'inline; filename="{document.title or "ai-lab-preview"}.html"'
        response.headers.pop("X-Frame-Options", None)
        return response


class AIStudySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blocked = ai_allowed_response(request, "summary")
        if blocked:
            return blocked
        document = get_temp_document(request, pk)

        try:
            result = generate_summary_with_source(document)
        except ValueError as exc:
            log_ai_usage(request, "summary", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            log_ai_usage(request, "summary", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.summary_data = result["items"]
        document.summary_source = result["source"]
        touch_temp_document(document)
        log_ai_usage(request, "summary", source=document.summary_source)
        return Response({"message": "Summary generated successfully.", "summary": document.summary_data, "source": document.summary_source})


class AIStudyQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blocked = ai_allowed_response(request, "flashcards")
        if blocked:
            return blocked
        document = get_temp_document(request, pk)

        try:
            result = generate_flashcards_with_source(document)
        except ValueError as exc:
            log_ai_usage(request, "flashcards", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            log_ai_usage(request, "flashcards", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.flashcards = result["items"]
        document.flashcards_source = result["source"]
        touch_temp_document(document)
        log_ai_usage(request, "flashcards", source=document.flashcards_source)
        return Response({"message": "Flashcards generated successfully.", "flashcards": document.flashcards, "source": document.flashcards_source})


class AIStudyMultipleChoiceQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blocked = ai_allowed_response(request, "quiz")
        if blocked:
            return blocked
        document = get_temp_document(request, pk)

        try:
            result = generate_multiple_choice_quiz_with_source(document)
        except ValueError as exc:
            log_ai_usage(request, "quiz", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            log_ai_usage(request, "quiz", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.quiz_data = result["items"]
        document.quiz_source = result["source"]
        touch_temp_document(document)
        log_ai_usage(request, "quiz", source=document.quiz_source)
        return Response({"message": "Quiz generated successfully.", "quiz": document.quiz_data, "source": document.quiz_source})


class AIStudyChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blocked = ai_allowed_response(request, "chat")
        if blocked:
            return blocked
        document = get_temp_document(request, pk)
        message = (request.data.get("message") or "").strip()

        if not message:
            return Response({"message": "Please enter a question."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response_data = answer_question(document, message, history=document.chat_history)
        except ValueError as exc:
            log_ai_usage(request, "chat", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            log_ai_usage(request, "chat", error_message=str(exc))
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        reply_message = response_data.get("message") if isinstance(response_data, dict) else response_data
        is_ai_generated = response_data.get("is_ai_generated", False) if isinstance(response_data, dict) else True

        chat_history = list(document.chat_history or [])
        chat_history.append({"role": "user", "message": message})
        chat_history.append(
            {
                "role": "assistant",
                "message": reply_message,
                "is_ai_generated": is_ai_generated,
                "source": response_data.get("source", "unknown") if isinstance(response_data, dict) else "unknown",
            }
        )

        document.chat_history = chat_history
        touch_temp_document(document)
        log_ai_usage(request, "chat", source=response_data.get("source", "unknown") if isinstance(response_data, dict) else "unknown")

        return Response(
            {
                "message": "Response generated successfully.",
                "reply": reply_message,
                "is_ai_generated": is_ai_generated,
                "chat_history": chat_history,
            }
        )
