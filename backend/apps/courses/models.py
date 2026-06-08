from django.conf import settings
from django.db import models


class RoutineSlot(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    class Color(models.TextChoices):
        BLUE = "blue", "Blue"
        PURPLE = "purple", "Purple"
        GREEN = "green", "Green"
        ORANGE = "orange", "Orange"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="routine_slots")
    day = models.PositiveSmallIntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    course_code = models.CharField(max_length=40)
    course_title = models.CharField(max_length=160)
    room_number = models.CharField(max_length=80)
    faculty_initial = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=20, choices=Color.choices, default=Color.BLUE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["day", "start_time", "course_code"]
        indexes = [
            models.Index(fields=["user", "day", "start_time"], name="routine_user_day_start_idx"),
        ]

    def __str__(self):
        return f"{self.course_code} - {self.course_title}"
