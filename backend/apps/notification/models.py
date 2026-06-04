from django.conf import settings
from django.db import models
from django.db.models import Q


class Notification(models.Model):
    class Type(models.TextChoices):
        INFO = "info", "Info"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"
        REMINDER = "reminder", "Reminder"
        TASK = "task", "Task"
        FILE = "file", "File"
        AI = "ai", "AI"
        MESSAGE = "message", "Message"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=120)
    message = models.TextField(blank=True)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.INFO)
    page = models.CharField(max_length=40, blank=True)
    url = models.URLField(blank=True)
    course_id = models.PositiveIntegerField(null=True, blank=True)
    resource_id = models.PositiveIntegerField(null=True, blank=True)
    source_key = models.CharField(max_length=120, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "source_key"],
                condition=~Q(source_key=""),
                name="unique_notification_source_per_user",
            )
        ]

    def __str__(self):
        return f"{self.owner.email}: {self.title}"
