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
    flashcards = models.JSONField(default=list, blank=True)
    quiz_data = models.JSONField(default=list, blank=True)
    chat_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.owner.email})"
