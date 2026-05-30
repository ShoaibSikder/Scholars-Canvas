from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "course", "priority", "status", "due_at")
    list_filter = ("priority", "status", "course")
    search_fields = ("title", "course", "user__email")
