from django.conf import settings
from django.db import models
from django.utils import timezone


class Task(models.Model):
    class Priority(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    course = models.CharField(max_length=120, blank=True)
    priority = models.CharField(max_length=12, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    due_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    study_started_at = models.DateTimeField(null=True, blank=True)
    accumulated_study_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["status", "due_at", "-created_at"]
        indexes = [
            models.Index(fields=["user", "due_at", "status"], name="task_user_due_status_idx"),
        ]

    def __str__(self):
        return self.title


class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="study_sessions")
    title = models.CharField(max_length=180, blank=True)
    course = models.CharField(max_length=120, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-started_at", "-created_at"]

    def save(self, *args, **kwargs):
        if self.ended_at and self.started_at:
            calculated_minutes = int((self.ended_at - self.started_at).total_seconds() // 60)
            self.duration_minutes = max(self.duration_minutes, calculated_minutes, 0)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or f"Study session ({self.duration_minutes} min)"
