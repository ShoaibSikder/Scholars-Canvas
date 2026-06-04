from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from .models import RoutineSlot


class RoutineSlotSerializer(serializers.ModelSerializer):
    live = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = RoutineSlot
        fields = [
            "id",
            "day",
            "start_time",
            "end_time",
            "course_code",
            "course_title",
            "room_number",
            "faculty_initial",
            "color",
            "live",
            "duration_minutes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "live", "duration_minutes", "created_at", "updated_at"]

    def validate(self, attrs):
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time.")

        return attrs

    def get_live(self, obj):
        now = timezone.localtime()
        return obj.day == now.weekday() and obj.start_time <= now.time() < obj.end_time

    def get_duration_minutes(self, obj):
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        return int((end - start).total_seconds() // 60)
