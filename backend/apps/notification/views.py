from django.db.models import Q
from django.core.cache import cache
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import RoutineSlot
from apps.db_safety import parse_page_window
from apps.tasks.models import Task

from .models import Notification


PAGE_SIZE = 12
IMPORTANT_GENERATED_PREFIXES = (
    "task-overdue-",
    "task-due-",
    "class-live-",
    "class-next-",
)
IMPORTANT_COMMUNICATION_PREFIXES = (
    "friend-request-",
    "friend-accepted-",
    "message-",
)
IMPORTANT_ADMIN_PREFIXES = (
    "admin-",
    "announcement:",
)


def format_time(value):
    return timezone.datetime.combine(timezone.datetime.today(), value).strftime("%I:%M %p").lstrip("0")


def serialize_notification(notification):
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "page": notification.page,
        "url": notification.url,
        "courseId": notification.course_id,
        "resourceId": notification.resource_id,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }


def upsert_notification(user, source_key, defaults):
    notification, created = Notification.objects.get_or_create(
        owner=user,
        source_key=source_key,
        defaults=defaults,
    )
    if not created:
        changed = False
        for key, value in defaults.items():
            if getattr(notification, key) != value:
                setattr(notification, key, value)
                changed = True
        if changed:
            notification.save(update_fields=[*defaults.keys()])
    return notification


def sync_generated_notifications(request):
    user = request.user
    now = timezone.localtime()
    today = now.weekday()
    current_time = now.time()

    overdue_tasks = (
        Task.objects.filter(user=user, due_at__lt=now)
        .exclude(status=Task.Status.DONE)
        .only("id", "title", "due_at")
        .order_by("due_at")[:8]
    )
    for task in overdue_tasks:
        upsert_notification(
            user,
            f"task-overdue-{task.id}",
            {
                "title": "Task overdue",
                "message": f"{task.title} was due {timezone.localtime(task.due_at).strftime('%b %d, %I:%M %p')}.",
                "type": Notification.Type.TASK,
                "page": "tasks",
            },
        )

    due_soon_limit = now + timezone.timedelta(hours=24)
    due_tasks = (
        Task.objects.filter(user=user, due_at__gte=now, due_at__lte=due_soon_limit)
        .exclude(status=Task.Status.DONE)
        .only("id", "title", "due_at")
        .order_by("due_at")[:8]
    )
    for task in due_tasks:
        upsert_notification(
            user,
            f"task-due-{task.id}",
            {
                "title": "Task due soon",
                "message": f"{task.title} is due {timezone.localtime(task.due_at).strftime('%b %d, %I:%M %p')}.",
                "type": Notification.Type.TASK,
                "page": "tasks",
            },
        )

    today_slots = (
        RoutineSlot.objects.filter(user=user, day=today)
        .only("id", "course_code", "room_number", "start_time", "end_time")
        .order_by("start_time")
    )
    current_class = today_slots.filter(start_time__lte=current_time, end_time__gt=current_time).first()
    if current_class:
        upsert_notification(
            user,
            f"class-live-{current_class.id}-{now.date().isoformat()}",
            {
                "title": "Class is live now",
                "message": f"{current_class.course_code} in {current_class.room_number} ends at {format_time(current_class.end_time)}.",
                "type": Notification.Type.REMINDER,
                "page": "routine",
            },
        )

    next_class = today_slots.filter(start_time__gt=current_time).first()
    if next_class:
        class_start = timezone.make_aware(timezone.datetime.combine(now.date(), next_class.start_time), timezone.get_current_timezone())
        if class_start <= now + timezone.timedelta(hours=2):
            upsert_notification(
                user,
                f"class-next-{next_class.id}-{now.date().isoformat()}",
                {
                    "title": "Class starts soon",
                    "message": f"{next_class.course_code} starts at {format_time(next_class.start_time)} in {next_class.room_number}.",
                    "type": Notification.Type.REMINDER,
                    "page": "routine",
                },
            )



def is_important_notification(notification):
    source_key = notification.source_key or ""
    important_prefixes = IMPORTANT_GENERATED_PREFIXES + IMPORTANT_COMMUNICATION_PREFIXES + IMPORTANT_ADMIN_PREFIXES

    return bool(source_key) and source_key.startswith(important_prefixes)


def important_notification_query():
    query = Q()
    for prefix in IMPORTANT_GENERATED_PREFIXES + IMPORTANT_COMMUNICATION_PREFIXES + IMPORTANT_ADMIN_PREFIXES:
        query |= Q(source_key__startswith=prefix)
    return query


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sync_cache_key = f"notifications-sync:{request.user.pk}"
        if not cache.get(sync_cache_key):
            sync_generated_notifications(request)
            cache.set(sync_cache_key, True, 60)
        limit, offset = parse_page_window(request.query_params, default_limit=PAGE_SIZE, max_limit=30)

        important_notifications = (
            Notification.objects.filter(owner=request.user)
            .filter(important_notification_query())
            .only(
                "id",
                "title",
                "message",
                "type",
                "page",
                "url",
                "course_id",
                "resource_id",
                "is_read",
                "created_at",
            )
            .order_by("-created_at", "-id")
        )
        total = important_notifications.count()
        unread_count = important_notifications.filter(is_read=False).count()
        items = important_notifications[offset : offset + limit]

        return Response(
            {
                "notifications": [serialize_notification(item) for item in items],
                "unread_count": unread_count,
                "has_more": offset + limit < total,
                "next_offset": offset + len(items),
            }
        )


class NotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(owner=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Notifications marked as read.", "unread_count": 0})
