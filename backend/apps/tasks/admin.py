from django.contrib import admin

from .models import StudySession, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "course", "priority", "status", "due_at", "created_at")
    list_filter = ("priority", "status", "course", "created_at", "due_at")
    search_fields = ("title", "course", "user__email")
    readonly_fields = ("notes",)


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "course", "duration_minutes", "started_at", "ended_at")
    list_filter = ("course", "started_at", "ended_at")
    search_fields = ("user__email", "user__full_name", "title", "course")
    readonly_fields = ("notes",)
