import mimetypes

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AIStudyDocument
from .serializers import AIStudyDocumentCreateSerializer, AIStudyDocumentSerializer, AIStudyDocumentVaultImportSerializer
from .services import answer_question, generate_flashcards, generate_multiple_choice_quiz, generate_summary


def serialize_document(document, request):
    return AIStudyDocumentSerializer(document, context={"request": request}).data


class AIStudyDocumentCollectionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        documents = AIStudyDocument.objects.filter(owner=request.user)
        document_id = request.query_params.get("document")
        active_document = None

        if document_id:
            active_document = documents.filter(id=document_id).first()
        if not active_document:
            active_document = documents.first()

        return Response(
            {
                "documents": [serialize_document(document, request) for document in documents],
                "active_document": serialize_document(active_document, request) if active_document else None,
            }
        )

    def post(self, request):
        serializer = AIStudyDocumentCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        return Response(
            {
                "message": "Document uploaded successfully.",
                "document": serialize_document(document, request),
            },
            status=status.HTTP_201_CREATED,
        )


class AIStudyVaultImportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        serializer = AIStudyDocumentVaultImportSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        return Response(
            {
                "message": "Vault file opened in AI Lab.",
                "document": serialize_document(document, request),
            },
            status=status.HTTP_201_CREATED,
        )


class AIStudyDocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get_object(self, request, pk):
        return get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)

    def get(self, request, pk):
        document = self.get_object(request, pk)
        return Response(serialize_document(document, request))

    def patch(self, request, pk):
        document = self.get_object(request, pk)
        serializer = AIStudyDocumentSerializer(document, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "Document updated successfully.",
                "document": serialize_document(document, request),
            }
        )

    def delete(self, request, pk):
        document = self.get_object(request, pk)
        document.delete()
        return Response({"message": "Document deleted successfully."})


@method_decorator(xframe_options_exempt, name="dispatch")
class AIStudyDocumentPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        document = get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)

        if not document.file:
            return Response({"message": "File not found."}, status=status.HTTP_404_NOT_FOUND)

        content_type = mimetypes.guess_type(document.file.name)[0] or "application/octet-stream"
        response = FileResponse(document.file.open("rb"), content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{document.file.name.rsplit("/", 1)[-1]}"'
        response.headers.pop("X-Frame-Options", None)
        return response


class AIStudySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)

        try:
            summary = generate_summary(document)
        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.summary_data = summary
        document.save(update_fields=["summary_data", "updated_at"])
        return Response({"message": "Summary generated successfully.", "summary": summary})


class AIStudyQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)

        try:
            flashcards = generate_flashcards(document)
        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.flashcards = flashcards
        document.save(update_fields=["flashcards", "updated_at"])
        return Response({"message": "Flashcards generated successfully.", "flashcards": flashcards})


class AIStudyMultipleChoiceQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)

        try:
            quiz = generate_multiple_choice_quiz(document)
        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        document.quiz_data = quiz
        document.save(update_fields=["quiz_data", "updated_at"])
        return Response({"message": "Quiz generated successfully.", "quiz": quiz})


class AIStudyChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        document = get_object_or_404(AIStudyDocument, pk=pk, owner=request.user)
        message = (request.data.get("message") or "").strip()

        if not message:
            return Response({"message": "Please enter a question."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reply = answer_question(document, message, history=document.chat_history)
        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        chat_history = list(document.chat_history or [])
        chat_history.append({"role": "user", "message": message})
        chat_history.append({"role": "assistant", "message": reply})

        document.chat_history = chat_history
        document.save(update_fields=["chat_history", "updated_at"])

        return Response(
            {
                "message": "Response generated successfully.",
                "reply": reply,
                "chat_history": chat_history,
            }
        )
