from django.utils import timezone
from rest_framework import serializers

from .models import Task


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
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "due", "created_at", "updated_at"]

    def get_due(self, obj):
        if not obj.due_at:
            return "No due date"

        local_due = timezone.localtime(obj.due_at)
        return local_due.strftime("%b %d, %Y %I:%M %p")
