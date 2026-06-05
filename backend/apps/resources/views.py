import mimetypes

from django.db.models import Count, Prefetch, Q
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VaultCourse, VaultResource
from .serializers import VaultCourseSerializer, VaultResourceSerializer


def courses_for_user(user):
    return (
        VaultCourse.objects.filter(user=user)
        .annotate(resource_count=Count("resources", filter=Q(resources__is_removed_by_admin=False) & Q(resources__moderation_status__in=["active", "flagged"])))
        .prefetch_related(Prefetch("resources", queryset=VaultResource.objects.filter(is_removed_by_admin=False).exclude(moderation_status="removed").order_by("category", "-created_at")))
        .order_by("-semester", "code")
    )


class ResourcesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = courses_for_user(request.user)
        serializer = VaultCourseSerializer(courses, many=True, context={"request": request})
        semesters = []

        for course in serializer.data:
            semester = course["semester"]
            group = next((item for item in semesters if item["semester"] == semester), None)
            if not group:
                group = {"semester": semester, "courses": []}
                semesters.append(group)
            group["courses"].append(course)

        return Response({"courses": semesters})

    def post(self, request):
        serializer = VaultCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ResourceCourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return get_object_or_404(VaultCourse, user=user, pk=pk)

    def patch(self, request, pk):
        course = self.get_object(request.user, pk)
        serializer = VaultCourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        course = self.get_object(request.user, pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseResourceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, course_id):
        course = get_object_or_404(VaultCourse, user=request.user, pk=course_id)
        files = request.FILES.getlist("files")

        if files:
            created_resources = []
            base_data = {
                "category": request.data.get("category", ""),
                "url": request.data.get("url", ""),
                "notes": request.data.get("notes", ""),
            }
            if "is_done" in request.data:
                base_data["is_done"] = request.data.get("is_done")

            for uploaded_file in files:
                data = base_data.copy()
                data["file"] = uploaded_file
                data["title"] = uploaded_file.name.rsplit(".", 1)[0] if len(files) > 1 else request.data.get("title", "").strip() or uploaded_file.name.rsplit(".", 1)[0]
                serializer = VaultResourceSerializer(data=data, context={"request": request})
                serializer.is_valid(raise_exception=True)
                is_done = serializer.validated_data.get("is_done", False)
                resource = serializer.save(course=course, completed_at=timezone.now() if is_done else None)
                created_resources.append(resource)

            response_serializer = VaultResourceSerializer(created_resources, many=True, context={"request": request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        serializer = VaultResourceSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        is_done = serializer.validated_data.get("is_done", False)
        serializer.save(course=course, completed_at=timezone.now() if is_done else None)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseResourceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self, user, course_id, pk):
        return get_object_or_404(VaultResource, course__user=user, course_id=course_id, pk=pk, is_removed_by_admin=False, moderation_status__in=["active", "flagged"])

    def patch(self, request, course_id, pk):
        resource = self.get_object(request.user, course_id, pk)
        serializer = VaultResourceSerializer(resource, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        if "is_done" in serializer.validated_data:
            serializer.save(completed_at=timezone.now() if serializer.validated_data["is_done"] else None)
        else:
            serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id, pk):
        resource = self.get_object(request.user, course_id, pk)
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(xframe_options_exempt, name="dispatch")
class CourseResourcePreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, pk):
        resource = get_object_or_404(VaultResource, course__user=request.user, course_id=course_id, pk=pk, is_removed_by_admin=False, moderation_status__in=["active", "flagged"])

        if not resource.file:
            return Response({"message": "File not found."}, status=status.HTTP_404_NOT_FOUND)

        content_type = mimetypes.guess_type(resource.file.name)[0] or "application/octet-stream"
        response = FileResponse(resource.file.open("rb"), content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{resource.file.name.rsplit("/", 1)[-1]}"'
        response.headers.pop("X-Frame-Options", None)
        return response


class CourseResourceDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, pk):
        resource = get_object_or_404(VaultResource, course__user=request.user, course_id=course_id, pk=pk, is_removed_by_admin=False, moderation_status__in=["active", "flagged"])

        if not resource.file:
            return Response({"message": "File not found."}, status=status.HTTP_404_NOT_FOUND)

        filename = resource.file.name.rsplit("/", 1)[-1]
        content_type = mimetypes.guess_type(resource.file.name)[0] or "application/octet-stream"
        response = FileResponse(resource.file.open("rb"), content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
