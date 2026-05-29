from django.urls import path

from .views import TasksView

urlpatterns = [
    path("", TasksView.as_view(), name="tasks-data"),
]
