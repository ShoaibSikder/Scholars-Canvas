from django.utils import timezone
from rest_framework import serializers

from .models import StudySession, Task


class TaskSerializer(serializers.ModelSerializer):
    due = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "course",
            "priority",
            "status",
            "due_at",
            "due",
            "notes",
            "study_started_at",
            "accumulated_study_minutes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "due", "study_started_at", "accumulated_study_minutes", "created_at", "updated_at"]

    def get_due(self, obj):
        if not obj.due_at:
            return "No due date"

        local_due = timezone.localtime(obj.due_at)
        return local_due.strftime("%b %d, %Y %I:%M %p")


class StudySessionSerializer(serializers.ModelSerializer):
    started_label = serializers.SerializerMethodField()

    class Meta:
        model = StudySession
        fields = [
            "id",
            "title",
            "course",
            "started_at",
            "started_label",
            "ended_at",
            "duration_minutes",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "started_label", "created_at"]

    def validate_duration_minutes(self, value):
        if value <= 0:
            raise serializers.ValidationError("Study duration must be greater than 0 minutes.")
        if value > 1440:
            raise serializers.ValidationError("Study duration cannot be more than 24 hours.")
        return value

    def get_started_label(self, obj):
        return timezone.localtime(obj.started_at).strftime("%b %d, %Y %I:%M %p")
