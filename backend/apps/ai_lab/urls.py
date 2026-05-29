from django.urls import path

from .views import AILabView

urlpatterns = [
    path("", AILabView.as_view(), name="ai-lab-data"),
]
