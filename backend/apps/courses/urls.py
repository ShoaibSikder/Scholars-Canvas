from django.urls import path

from .views import DashboardView, RoutineDetailView, RoutineView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard-data"),
    path("routine/", RoutineView.as_view(), name="routine-data"),
    path("routine/<int:pk>/", RoutineDetailView.as_view(), name="routine-detail"),
]
