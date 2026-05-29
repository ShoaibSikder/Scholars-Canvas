from django.urls import path

from .views import ResourcesView

urlpatterns = [
    path("", ResourcesView.as_view(), name="resources-data"),
]
