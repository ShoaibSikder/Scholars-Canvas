from django.urls import path

from .views import StudySessionsView, TaskDetailView, TasksView

urlpatterns = [
    path("", TasksView.as_view(), name="tasks-data"),
    path("study-sessions/", StudySessionsView.as_view(), name="study-sessions"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
