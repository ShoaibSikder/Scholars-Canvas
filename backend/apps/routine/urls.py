from django.urls import path

from .views import RoutineDetailView, RoutineView

urlpatterns = [
    path("routine/", RoutineView.as_view(), name="routine-data"),
    path("routine/<int:pk>/", RoutineDetailView.as_view(), name="routine-detail"),
]
