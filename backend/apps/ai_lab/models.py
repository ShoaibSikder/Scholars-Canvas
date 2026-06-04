from django.conf import settings
from django.db import models


class AIStudyDocument(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_documents")
    source_resource = models.ForeignKey(
        "resources.VaultResource",
        on_delete=models.SET_NULL,
        related_name="ai_documents",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    course = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to="ai-lab/%Y/%m/")
    extracted_text = models.TextField(blank=True)
    summary_data = models.JSONField(default=list, blank=True)
    summary_source = models.CharField(max_length=32, blank=True, default="")
    flashcards = models.JSONField(default=list, blank=True)
    flashcards_source = models.CharField(max_length=32, blank=True, default="")
    quiz_data = models.JSONField(default=list, blank=True)
    quiz_source = models.CharField(max_length=32, blank=True, default="")
    chat_history = models.JSONField(default=list, blank=True)
    ai_processing_allowed = models.BooleanField(default=True)
    last_error = models.TextField(blank=True)
    request_count = models.PositiveIntegerField(default=0)
    provider = models.CharField(max_length=40, blank=True)
    model_name = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.owner.email})"
