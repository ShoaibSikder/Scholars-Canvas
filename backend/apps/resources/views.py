from django.db.models import Count, Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
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
        .annotate(resource_count=Count("resources"))
        .prefetch_related(Prefetch("resources", queryset=VaultResource.objects.order_by("category", "-created_at")))
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
        serializer = VaultResourceSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        is_done = serializer.validated_data.get("is_done", False)
        serializer.save(course=course, completed_at=timezone.now() if is_done else None)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseResourceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self, user, course_id, pk):
        return get_object_or_404(VaultResource, course__user=user, course_id=course_id, pk=pk)

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
