from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import RoutineSlot
from apps.resources.models import VaultResource
from apps.tasks.models import Task


def format_time(value):
    return timezone.datetime.combine(timezone.datetime.today(), value).strftime("%I:%M %p").lstrip("0")


def resource_target(request, resource):
    if resource.file:
        return request.build_absolute_uri(resource.file.url)
    return resource.url or ""


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.localtime()
        today = now.weekday()
        current_time = now.time()
        items = []

        overdue_tasks = Task.objects.filter(user=user, due_at__lt=now).exclude(status=Task.Status.DONE).order_by("due_at")[:4]
        for task in overdue_tasks:
            items.append(
                {
                    "id": f"task-overdue-{task.id}",
                    "title": "Task overdue",
                    "message": f"{task.title} was due {timezone.localtime(task.due_at).strftime('%b %d, %I:%M %p')}.",
                    "type": "task",
                    "page": "tasks",
                    "created_at": task.due_at.isoformat(),
                }
            )

        due_soon_limit = now + timezone.timedelta(hours=24)
        due_tasks = Task.objects.filter(user=user, due_at__gte=now, due_at__lte=due_soon_limit).exclude(status=Task.Status.DONE).order_by("due_at")[:4]
        for task in due_tasks:
            items.append(
                {
                    "id": f"task-due-{task.id}",
                    "title": "Task due soon",
                    "message": f"{task.title} is due {timezone.localtime(task.due_at).strftime('%b %d, %I:%M %p')}.",
                    "type": "task",
                    "page": "tasks",
                    "created_at": task.due_at.isoformat(),
                }
            )

        today_slots = RoutineSlot.objects.filter(user=user, day=today).order_by("start_time")
        current_class = today_slots.filter(start_time__lte=current_time, end_time__gte=current_time).first()
        if current_class:
            items.append(
                {
                    "id": f"class-live-{current_class.id}",
                    "title": "Class is live now",
                    "message": f"{current_class.course_code} in {current_class.room_number} ends at {format_time(current_class.end_time)}.",
                    "type": "reminder",
                    "page": "routine",
                    "created_at": now.isoformat(),
                }
            )

        next_class = today_slots.filter(start_time__gt=current_time).first()
        if next_class:
            class_start = timezone.make_aware(timezone.datetime.combine(now.date(), next_class.start_time), timezone.get_current_timezone())
            if class_start <= now + timezone.timedelta(hours=2):
                items.append(
                    {
                        "id": f"class-next-{next_class.id}",
                        "title": "Class starts soon",
                        "message": f"{next_class.course_code} starts at {format_time(next_class.start_time)} in {next_class.room_number}.",
                        "type": "reminder",
                        "page": "routine",
                        "created_at": class_start.isoformat(),
                    }
                )

        recent_cutoff = now - timezone.timedelta(days=3)
        recent_resources = VaultResource.objects.filter(course__user=user, created_at__gte=recent_cutoff).select_related("course").order_by("-created_at")[:4]
        for resource in recent_resources:
            items.append(
                {
                    "id": f"resource-{resource.id}",
                    "title": "New vault resource",
                    "message": f"{resource.title} was added to {resource.course.code}.",
                    "type": "file",
                    "page": "vault",
                    "courseId": resource.course_id,
                    "resourceId": resource.id,
                    "url": resource_target(request, resource),
                    "created_at": resource.created_at.isoformat(),
                }
            )

        items.sort(key=lambda item: item.get("created_at", ""), reverse=True)
        return Response({"notifications": items[:10], "unread_count": len(items[:10])})
