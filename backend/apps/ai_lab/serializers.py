from pathlib import Path

from rest_framework import serializers
from django.urls import reverse

from apps.resources.models import VaultResource

from .models import AIStudyDocument
from .services import SUPPORTED_TEXT_EXTENSIONS, extract_document_text


class AIStudyDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    text_preview = serializers.SerializerMethodField()

    class Meta:
        model = AIStudyDocument
        fields = [
            "id",
            "source_resource",
            "title",
            "course",
            "file",
            "file_url",
            "file_name",
            "preview_url",
            "text_preview",
            "summary_data",
            "flashcards",
            "quiz_data",
            "chat_history",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "source_resource",
            "file_url",
            "file_name",
            "preview_url",
            "text_preview",
            "summary_data",
            "flashcards",
            "quiz_data",
            "chat_history",
            "created_at",
            "updated_at",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return ""
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_file_name(self, obj):
        if not obj.file:
            return ""
        return Path(obj.file.name).name

    def get_preview_url(self, obj):
        request = self.context.get("request")
        if not obj.file or not obj.pk:
            return ""

        url = reverse("ai-lab-document-preview", kwargs={"pk": obj.pk})
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_text_preview(self, obj):
        return (obj.extracted_text or "")[:500]


class AIStudyDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIStudyDocument
        fields = ["id", "title", "course", "file"]

    def validate_file(self, value):
        extension = Path(value.name).suffix.lower()
        if extension not in SUPPORTED_TEXT_EXTENSIONS:
            supported = ", ".join(sorted(SUPPORTED_TEXT_EXTENSIONS))
            raise serializers.ValidationError(f"Unsupported file type. Supported study files: {supported}.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        owner = request.user
        title = validated_data.get("title") or Path(validated_data["file"].name).stem
        course = validated_data.get("course") or ""

        document = AIStudyDocument.objects.create(
            owner=owner,
            title=title,
            course=course,
            file=validated_data["file"],
        )

        document.extracted_text = extract_document_text(document.file.path)
        document.save(update_fields=["extracted_text", "updated_at"])
        return document


class AIStudyDocumentVaultImportSerializer(serializers.Serializer):
    resource_id = serializers.IntegerField()

    def validate_resource_id(self, value):
        request = self.context["request"]
        resource = VaultResource.objects.filter(pk=value, course__user=request.user).select_related("course").first()

        if not resource:
            raise serializers.ValidationError("Vault file not found.")
        if not resource.file:
            raise serializers.ValidationError("Only uploaded Vault files can be opened in AI Lab.")

        extension = Path(resource.file.name).suffix.lower()
        if extension not in SUPPORTED_TEXT_EXTENSIONS:
            supported = ", ".join(sorted(SUPPORTED_TEXT_EXTENSIONS))
            raise serializers.ValidationError(f"Unsupported file type. Supported study files: {supported}.")

        self.context["resource"] = resource
        return value

    def create(self, validated_data):
        request = self.context["request"]
        resource = self.context["resource"]
        course = resource.course

        document = AIStudyDocument.objects.create(
            owner=request.user,
            source_resource=resource,
            title=resource.title,
            course=f"{course.code} - {course.title}",
            file=resource.file.name,
        )
        document.extracted_text = extract_document_text(document.file.path)
        document.save(update_fields=["extracted_text", "updated_at"])
        return document
