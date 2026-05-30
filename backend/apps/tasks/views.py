from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskSerializer


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
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        task = self.get_object(request.user, pk)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
