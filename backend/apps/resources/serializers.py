from pathlib import Path

from rest_framework import serializers
from django.urls import reverse

from apps.administration.utils import setting_value

from .models import VaultCourse, VaultResource


def detect_resource_type(file_obj=None, url=""):
    name = getattr(file_obj, "name", "") or ""
    extension = Path(name).suffix.lower()

    if extension == ".pdf":
        return VaultResource.ResourceType.PDF
    if extension in {".doc", ".docx", ".txt", ".md", ".rtf", ".odt"}:
        return VaultResource.ResourceType.DOC
    if extension in {".ppt", ".pptx", ".odp"}:
        return VaultResource.ResourceType.SLIDE
    if extension in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"}:
        return VaultResource.ResourceType.IMAGE
    if extension:
        return VaultResource.ResourceType.OTHER

    if url:
        return VaultResource.ResourceType.LINK

    return VaultResource.ResourceType.OTHER


class VaultResourceSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    resource_type_label = serializers.CharField(source="get_resource_type_display", read_only=True)
    file_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = VaultResource
        fields = [
            "id",
            "category",
            "category_label",
            "title",
            "resource_type",
            "resource_type_label",
            "file",
            "file_url",
            "preview_url",
            "download_url",
            "url",
            "notes",
            "is_done",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "category_label", "resource_type_label", "file_url", "preview_url", "download_url", "completed_at", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)

        file_obj = attrs.get("file")
        url = attrs.get("url", "")

        if not file_obj and self.instance:
            file_obj = self.instance.file
        if not url and self.instance:
            url = self.instance.url

        request = self.context.get("request")
        if file_obj and request:
            allowed = setting_value("allowed_upload_file_extensions", [])
            if isinstance(allowed, str):
                allowed = [item.strip() for item in allowed.split(",") if item.strip()]
            extension = Path(getattr(file_obj, "name", "")).suffix.lower()
            if allowed and extension not in {item.lower() for item in allowed}:
                raise serializers.ValidationError("This file type is not allowed.")

            upload_limit_mb = request.user.upload_limit_mb or setting_value("max_upload_size_mb", 25)
            if upload_limit_mb and getattr(file_obj, "size", 0) > upload_limit_mb * 1024 * 1024:
                raise serializers.ValidationError(f"File exceeds your {upload_limit_mb} MB upload limit.")

        attrs["resource_type"] = detect_resource_type(file_obj=file_obj, url=url)
        if file_obj:
            attrs["file_size"] = getattr(file_obj, "size", 0) or 0
            attrs["content_type"] = getattr(file_obj, "content_type", "") or ""
        return attrs

    def get_file_url(self, obj):
        if not obj.file:
            return ""

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_preview_url(self, obj):
        if not obj.file or not obj.pk:
            return ""

        request = self.context.get("request")
        url = reverse("course-resource-preview", kwargs={"course_id": obj.course_id, "pk": obj.pk})
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_download_url(self, obj):
        if not obj.file or not obj.pk:
            return ""

        request = self.context.get("request")
        url = reverse("course-resource-download", kwargs={"course_id": obj.course_id, "pk": obj.pk})
        if request:
            return request.build_absolute_uri(url)
        return url


class VaultCourseSerializer(serializers.ModelSerializer):
    resources = VaultResourceSerializer(many=True, read_only=True)
    resource_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = VaultCourse
        fields = [
            "id",
            "semester",
            "code",
            "title",
            "resource_count",
            "resources",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "resource_count", "resources", "created_at", "updated_at"]
