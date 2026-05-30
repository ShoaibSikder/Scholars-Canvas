from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.resources.models import VaultCourse, VaultResource
from apps.tasks.models import Task

from .models import RoutineSlot
from .serializers import RoutineSlotSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.localtime()
        today = now.weekday()
        current_time = now.time()
        slots = list(RoutineSlot.objects.filter(user=user))
        today_slots = sorted((slot for slot in slots if slot.day == today), key=lambda slot: slot.start_time)

        current_class = next(
            (slot for slot in today_slots if slot.start_time <= current_time <= slot.end_time),
            None,
        )
        next_class = next(
            (slot for slot in today_slots if slot.start_time > current_time),
            None,
        )

        def format_time(value):
            return timezone.datetime.combine(timezone.datetime.today(), value).strftime("%I:%M %p").lstrip("0")

        study_data = []
        for index, label in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]):
            day_slots = [slot for slot in slots if slot.day == index]
            minutes = sum(
                int(
                    (
                        timezone.datetime.combine(timezone.datetime.today(), slot.end_time)
                        - timezone.datetime.combine(timezone.datetime.today(), slot.start_time)
                    ).total_seconds()
                    // 60
                )
                for slot in day_slots
            )
            study_data.append({"day": label, "hours": round(minutes / 60, 1)})

        top_tasks = []
        tasks = (
            Task.objects.filter(user=user)
            .exclude(status=Task.Status.DONE)
            .order_by("due_at", "-created_at")[:4]
        )
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
                    "url": request.build_absolute_uri(resource.file.url) if resource.file else resource.url,
                    "type": resource.resource_type,
                }
            )

        vault_courses = VaultCourse.objects.filter(user=user).prefetch_related("resources").order_by("-semester", "code")
        course_progress = []
        semester_map = {}

        for course in vault_courses:
            resources_for_course = list(course.resources.all())
            total = len(resources_for_course)
            done = sum(1 for resource in resources_for_course if resource.is_done)
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

        return Response(
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


class RoutineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        slots = RoutineSlot.objects.filter(user=request.user)
        serializer = RoutineSlotSerializer(slots, many=True)
        return Response({"slots": serializer.data})

    def post(self, request):
        serializer = RoutineSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoutineDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return get_object_or_404(RoutineSlot, user=user, pk=pk)

    def patch(self, request, pk):
        slot = self.get_object(request.user, pk)
        serializer = RoutineSlotSerializer(slot, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        slot = self.get_object(request.user, pk)
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
