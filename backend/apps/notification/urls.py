from django.urls import path

from .views import NotificationsReadView, NotificationsView

urlpatterns = [
    path("", NotificationsView.as_view(), name="notification-list"),
    path("read/", NotificationsReadView.as_view(), name="notification-read"),
]
