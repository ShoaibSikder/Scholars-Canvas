from rest_framework import serializers

from .models import VaultCourse, VaultResource


class VaultResourceSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    resource_type_label = serializers.CharField(source="get_resource_type_display", read_only=True)
    file_url = serializers.SerializerMethodField()

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
            "url",
            "notes",
            "is_done",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "category_label", "resource_type_label", "file_url", "completed_at", "created_at", "updated_at"]

    def get_file_url(self, obj):
        if not obj.file:
            return ""

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


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
