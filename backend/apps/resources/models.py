from django.conf import settings
from django.db import models


class VaultCourse(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vault_courses")
    semester = models.PositiveSmallIntegerField()
    code = models.CharField(max_length=40)
    title = models.CharField(max_length=160)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-semester", "code"]
        unique_together = ("user", "semester", "code")

    def __str__(self):
        return f"Semester {self.semester} - {self.code}"


class VaultResource(models.Model):
    class Category(models.TextChoices):
        MID_TERM = "mid_term", "Mid Term"
        FINAL = "final", "Final"
        ASSIGNMENT = "assignment", "Assignment / Presentation"
        LINK = "link", "Links"

    class ResourceType(models.TextChoices):
        PDF = "pdf", "PDF"
        DOC = "doc", "Document"
        SLIDE = "slide", "Slide"
        IMAGE = "image", "Image"
        LINK = "link", "Link"
        OTHER = "other", "Other"

    course = models.ForeignKey(VaultCourse, on_delete=models.CASCADE, related_name="resources")
    category = models.CharField(max_length=24, choices=Category.choices)
    title = models.CharField(max_length=180)
    resource_type = models.CharField(max_length=16, choices=ResourceType.choices, default=ResourceType.PDF)
    file = models.FileField(upload_to="vault_resources/", blank=True)
    url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    public_access_revoked = models.BooleanField(default=False)
    is_removed_by_admin = models.BooleanField(default=False)
    moderation_status = models.CharField(
        max_length=24,
        choices=[
            ("active", "Active"),
            ("flagged", "Flagged"),
            ("removed", "Removed"),
        ],
        default="active",
    )
    moderation_note = models.TextField(blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    content_type = models.CharField(max_length=120, blank=True)
    is_done = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = getattr(self.file, "size", self.file_size or 0) or 0
        super().save(*args, **kwargs)
