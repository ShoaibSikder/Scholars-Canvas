from django.contrib import admin

from .models import RoutineSlot


@admin.register(RoutineSlot)
class RoutineSlotAdmin(admin.ModelAdmin):
    list_display = ("course_code", "course_title", "user", "day", "start_time", "end_time", "room_number")
    list_filter = ("day", "color")
    search_fields = ("course_code", "course_title", "room_number", "faculty_initial", "user__email")
