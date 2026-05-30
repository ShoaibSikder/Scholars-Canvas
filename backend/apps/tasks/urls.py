from django.urls import path

from .views import TaskDetailView, TasksView

urlpatterns = [
    path("", TasksView.as_view(), name="tasks-data"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
