from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import RoutineSlot
from apps.media_urls import request_media_url
from apps.resources.models import VaultCourse, VaultResource
from apps.tasks.models import Task


def format_time(value):
    return timezone.datetime.combine(timezone.datetime.today(), value).strftime("%I:%M %p").lstrip("0")


def resource_target(request, resource):
    if resource.file:
        return request_media_url(request, resource.file)
    return resource.url or ""


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response({"results": []})

        course_filter = Q(code__icontains=query) | Q(title__icontains=query) | Q(semester__icontains=query)
        resource_filter = (
            Q(title__icontains=query)
            | Q(notes__icontains=query)
            | Q(resource_type__icontains=query)
            | Q(category__icontains=query)
            | Q(file__icontains=query)
            | Q(url__icontains=query)
            | Q(course__code__icontains=query)
            | Q(course__title__icontains=query)
        )

        results = []
        courses = VaultCourse.objects.filter(user=request.user).annotate(resource_count=Count("resources")).filter(course_filter).order_by("-semester", "code")[:6]
        for course in courses:
            results.append(
                {
                    "id": f"course-{course.id}",
                    "kind": "course",
                    "label": course.code,
                    "description": f"{course.title} / Semester {course.semester} / {course.resource_count} resources",
                    "page": "vault",
                    "courseId": course.id,
                }
            )

        resources = VaultResource.objects.filter(course__user=request.user).select_related("course").filter(resource_filter).order_by("-updated_at")[:10]
        for resource in resources:
            label = resource.title
            if resource.file:
                label = resource.file.name.split("/")[-1] or resource.title
            results.append(
                {
                    "id": f"resource-{resource.id}",
                    "kind": "resource",
                    "label": label,
                    "description": f"{resource.course.code} / {resource.get_resource_type_display()} / {resource.get_category_display()}",
                    "page": "vault",
                    "courseId": resource.course_id,
                    "resourceId": resource.id,
                    "url": resource_target(request, resource),
                }
            )

        routine_slots = RoutineSlot.objects.filter(user=request.user).filter(
            Q(course_code__icontains=query)
            | Q(course_title__icontains=query)
            | Q(room_number__icontains=query)
            | Q(faculty_initial__icontains=query)
        ).order_by("day", "start_time")[:5]
        for slot in routine_slots:
            results.append(
                {
                    "id": f"routine-{slot.id}",
                    "kind": "routine",
                    "label": slot.course_code,
                    "description": f"{slot.course_title} / {slot.room_number} / {format_time(slot.start_time)}",
                    "page": "routine",
                }
            )

        tasks = Task.objects.filter(user=request.user).filter(Q(title__icontains=query) | Q(course__icontains=query) | Q(notes__icontains=query)).order_by("status", "due_at")[:5]
        for task in tasks:
            results.append(
                {
                    "id": f"task-{task.id}",
                    "kind": "task",
                    "label": task.title,
                    "description": f"{task.course or 'Task'} / {task.get_status_display()} / {task.get_priority_display()} priority",
                    "page": "tasks",
                }
            )

        return Response({"results": results[:20]})
