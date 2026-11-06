from django.shortcuts import get_object_or_404
from datetime import timedelta
import logging
from time import perf_counter

from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.media_urls import request_media_url
from apps.accounts.models import UserPreferences
from apps.resources.models import VaultCourse, VaultResource
from apps.tasks.models import StudySession, Task

from .models import RoutineSlot
from .serializers import RoutineSlotSerializer


logger = logging.getLogger("studentassistant.request")


def format_time(value):
    return timezone.datetime.combine(timezone.datetime.today(), value).strftime("%I:%M %p").lstrip("0")


def resource_target(request, resource):
    if resource.file:
        return request_media_url(request, resource.file)
    return resource.url or ""


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        started = perf_counter()
        user = request.user
        now = timezone.localtime()
        today = now.weekday()
        current_time = now.time()
        slots = list(RoutineSlot.objects.filter(user=user))
        today_slots = sorted((slot for slot in slots if slot.day == today), key=lambda slot: slot.start_time)

        current_class = next(
            (slot for slot in today_slots if slot.start_time <= current_time < slot.end_time),
            None,
        )
        next_class = next(
            (slot for slot in today_slots if slot.start_time > current_time),
            None,
        )

        week_start = (now - timedelta(days=now.weekday())).date()
        week_end = week_start + timedelta(days=7)
        local_timezone = timezone.get_current_timezone()
        week_start_at = timezone.make_aware(
            timezone.datetime.combine(week_start, timezone.datetime.min.time()), local_timezone
        )
        week_end_at = timezone.make_aware(
            timezone.datetime.combine(week_end, timezone.datetime.min.time()), local_timezone
        )
        study_minutes_by_day = {index: 0 for index in range(7)}
        study_sessions = StudySession.objects.filter(
            user=user,
            title="Website study time",
            started_at__gte=week_start_at,
            started_at__lt=week_end_at,
        )
        for result in study_sessions.annotate(
            local_day=TruncDate("started_at", tzinfo=local_timezone)
        ).values("local_day").annotate(minutes=Sum("duration_minutes")):
            study_minutes_by_day[result["local_day"].weekday()] = result["minutes"] or 0

        study_data = []
        for index, label in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]):
            minutes = study_minutes_by_day[index]
            study_data.append({"day": label, "hours": round(minutes / 60, 1)})

        study_distribution = [
            {
                "course": row["course"] or "Online Activity",
                "hours": round((row["minutes"] or 0) / 60, 1),
            }
            for row in study_sessions.values("course")
            .annotate(minutes=Sum("duration_minutes"))
            .order_by("-minutes")[:6]
        ]

        task_queryset = Task.objects.filter(user=user)
        today_start = timezone.make_aware(
            timezone.datetime.combine(now.date(), timezone.datetime.min.time()), local_timezone
        )
        today_end = today_start + timedelta(days=1)
        task_aggregates = task_queryset.aggregate(
            todo=Count("id", filter=Q(status=Task.Status.TODO)),
            in_progress=Count("id", filter=Q(status=Task.Status.IN_PROGRESS)),
            done=Count("id", filter=Q(status=Task.Status.DONE)),
            due_today=Count(
                "id",
                filter=~Q(status=Task.Status.DONE)
                & Q(due_at__gte=today_start, due_at__lt=today_end),
            ),
        )
        task_status_counts = {
            "todo": task_aggregates["todo"],
            "inProgress": task_aggregates["in_progress"],
            "done": task_aggregates["done"],
        }

        upcoming_deadlines = []
        timeline_end = now + timedelta(days=30)
        deadline_tasks = task_queryset.exclude(status=Task.Status.DONE).filter(
            due_at__gte=now, due_at__lte=timeline_end
        ).order_by("due_at").only("id", "title", "course", "priority", "due_at")[:8]
        for task in deadline_tasks:
            local_due = timezone.localtime(task.due_at)
            days_until = max(0, (local_due.date() - now.date()).days)
            upcoming_deadlines.append(
                {
                    "id": task.id,
                    "title": task.title,
                    "course": task.course or "General",
                    "priority": task.priority,
                    "due": local_due.strftime("%b %d"),
                    "daysUntil": days_until,
                    "offset": round(min(100, (days_until / 30) * 100)),
                }
            )

        today_due_task_count = task_aggregates["due_today"]
        top_tasks = []
        tasks = task_queryset.exclude(status=Task.Status.DONE).only(
            "id", "title", "priority", "due_at", "created_at"
        ).order_by(F("due_at").asc(nulls_last=True), "-created_at")[:4]
        for task in tasks:
            if task.due_at:
                due = timezone.localtime(task.due_at).strftime("%b %d, %I:%M %p")
            else:
                due = "No due date"
            top_tasks.append(
                {
                    "id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "due": due,
                }
            )

        recent_files = []
        resources = (
            VaultResource.objects.filter(course__user=user)
            .select_related("course")
            .order_by("-updated_at")[:5]
        )
        for resource in resources:
            recent_files.append(
                {
                    "id": resource.id,
                    "name": resource.title,
                    "course": resource.course.code,
                    "accessed": timezone.localtime(resource.updated_at).strftime("%b %d"),
                    "url": resource_target(request, resource),
                    "type": resource.resource_type,
                }
            )

        vault_courses = VaultCourse.objects.filter(user=user).annotate(
            total_resources=Count("resources"),
            completed_resources=Count("resources", filter=Q(resources__is_done=True)),
        ).order_by("-semester", "code")
        course_progress = []
        semester_map = {}

        for course in vault_courses:
            total = course.total_resources
            done = course.completed_resources
            percent = round((done / total) * 100) if total else 0
            course_progress.append(
                {
                    "id": course.id,
                    "semester": course.semester,
                    "code": course.code,
                    "title": course.title,
                    "done": done,
                    "total": total,
                    "percent": percent,
                }
            )

            semester_entry = semester_map.setdefault(course.semester, {"semester": course.semester, "done": 0, "total": 0})
            semester_entry["done"] += done
            semester_entry["total"] += total

        semester_progress = []
        for item in sorted(semester_map.values(), key=lambda entry: entry["semester"], reverse=True):
            total = item["total"]
            item["percent"] = round((item["done"] / total) * 100) if total else 0
            semester_progress.append(item)

        weekly_average = round(sum(item["hours"] for item in study_data) / 7, 1)
        best_day = max(study_data, key=lambda item: item["hours"], default={"day": "-", "hours": 0})

        response = Response(
            {
                "profile": {
                    "full_name": user.full_name,
                    "email": user.email,
                },
                "studyData": study_data,
                "studySummary": {
                    "weeklyAverage": f"{weekly_average} hrs",
                    "bestDay": f"{best_day['day']} / {best_day['hours']} hrs",
                },
                "studyDistribution": study_distribution,
                "taskStatus": task_status_counts,
                "todayDueTaskCount": today_due_task_count,
                "deadlineTimeline": upcoming_deadlines,
                "currentClass": {
                    "id": current_class.id,
                    "name": f"{current_class.course_code} - {current_class.course_title}",
                    "room": current_class.room_number,
                    "faculty": current_class.faculty_initial,
                    "isLive": True,
                    "endTime": format_time(current_class.end_time),
                }
                if current_class
                else None,
                "nextClass": {
                    "id": next_class.id,
                    "name": f"{next_class.course_code} - {next_class.course_title}",
                    "room": next_class.room_number,
                    "faculty": next_class.faculty_initial,
                    "startTime": format_time(next_class.start_time),
                }
                if next_class
                else None,
                "topTasks": top_tasks,
                "recentFiles": recent_files,
                "courseProgress": course_progress[:6],
                "semesterProgress": semester_progress[:4],
            }
        )
        total_ms = (perf_counter() - started) * 1000
        response["Server-Timing"] = f"dashboard;dur={total_ms:.1f}"
        logger.info("dashboard timings user=%s total=%.1fms", user.pk, total_ms)
        return response


