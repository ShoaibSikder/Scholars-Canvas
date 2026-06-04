from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudySession, Task
from .serializers import StudySessionSerializer, TaskSerializer


def finish_task_study_session(task):
    if not task.study_started_at:
        return

    finished_at = timezone.now()
    minutes = max(1, int((finished_at - task.study_started_at).total_seconds() // 60))
    StudySession.objects.create(
        user=task.user,
        title=task.title,
        course=task.course,
        started_at=task.study_started_at,
        ended_at=finished_at,
        duration_minutes=minutes,
        notes="Automatically tracked from task study time.",
    )
    task.accumulated_study_minutes += minutes
    task.study_started_at = None


def apply_task_tracking(task, next_status):
    previous_status = task.status
    if next_status == Task.Status.IN_PROGRESS and previous_status != Task.Status.IN_PROGRESS and not task.study_started_at:
        task.study_started_at = timezone.now()
    elif previous_status == Task.Status.IN_PROGRESS and next_status != Task.Status.IN_PROGRESS:
        finish_task_study_session(task)


def grouped_tasks_for_user(user):
    tasks = Task.objects.filter(user=user)
    serializer = TaskSerializer(tasks, many=True)
    grouped = {
        "todo": [],
        "inProgress": [],
        "done": [],
    }

    for task in serializer.data:
        if task["status"] == Task.Status.IN_PROGRESS:
            grouped["inProgress"].append(task)
        elif task["status"] == Task.Status.DONE:
            grouped["done"].append(task)
        else:
            grouped["todo"].append(task)

    return grouped


class TasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(grouped_tasks_for_user(request.user))

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(user=request.user)
        if task.status == Task.Status.IN_PROGRESS and not task.study_started_at:
            task.study_started_at = timezone.now()
            task.save(update_fields=["study_started_at", "updated_at"])
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudySessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user)[:30]
        serializer = StudySessionSerializer(sessions, many=True)
        return Response({"sessions": serializer.data})

    def post(self, request):
        serializer = StudySessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return get_object_or_404(Task, user=user, pk=pk)

    def patch(self, request, pk):
        task = self.get_object(request.user, pk)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        next_status = serializer.validated_data.get("status", task.status)
        apply_task_tracking(task, next_status)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        task = self.get_object(request.user, pk)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
