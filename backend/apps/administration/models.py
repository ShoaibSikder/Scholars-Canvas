from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.db import models


class SystemSetting(models.Model):
    class SettingType(models.TextChoices):
        STRING = "string", "String"
        INTEGER = "integer", "Integer"
        BOOLEAN = "boolean", "Boolean"
        JSON = "json", "JSON"

    key = models.SlugField(max_length=120, unique=True)
    label = models.CharField(max_length=180)
    setting_type = models.CharField(max_length=16, choices=SettingType.choices, default=SettingType.STRING)
    value = models.JSONField(default=dict, blank=True)
    is_secret = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return self.label or self.key

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        cache.delete(f"system-setting:{self.key}")

    def delete(self, *args, **kwargs):
        cache_key = f"system-setting:{self.key}"
        result = super().delete(*args, **kwargs)
        cache.delete(cache_key)
        return result


class Report(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWING = "reviewing", "Reviewing"
        RESOLVED = "resolved", "Resolved"
        DISMISSED = "dismissed", "Dismissed"

    class Reason(models.TextChoices):
        ABUSE = "abuse", "Abuse"
        SPAM = "spam", "Spam"
        COPYRIGHT = "copyright", "Copyright"
        UNSAFE_AI = "unsafe_ai", "Unsafe AI"
        INAPPROPRIATE = "inappropriate", "Inappropriate"
        OTHER = "other", "Other"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="submitted_reports")
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reports_against")
    reason = models.CharField(max_length=24, choices=Reason.choices, default=Reason.OTHER)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_reports")
    content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    resolution_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.reason} report #{self.pk}"


class AIUsageLog(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        BLOCKED = "blocked", "Blocked"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_usage_logs")
    feature = models.CharField(max_length=40)
    provider = models.CharField(max_length=40, blank=True)
    model_name = models.CharField(max_length=120, blank=True)
    prompt_tokens = models.PositiveIntegerField(default=0)
    response_tokens = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUCCESS)
    error_message = models.TextField(blank=True)
    unsafe_prompt = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} {self.feature} {self.status}"


class NotificationTemplate(models.Model):
    key = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=160)
    message = models.TextField()
    type = models.CharField(max_length=16, default="info")
    page = models.CharField(max_length=40, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return self.title


class SystemAnnouncement(models.Model):
    title = models.CharField(max_length=160)
    message = models.TextField()
    university = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    semester = models.PositiveSmallIntegerField(null=True, blank=True)
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class AdminAuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=120)
    target_label = models.CharField(max_length=255, blank=True)
    content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["actor", "-created_at"], name="audit_actor_created_idx"),
        ]

    def __str__(self):
        return f"{self.actor} {self.action}"
