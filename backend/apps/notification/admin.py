from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("owner", "title", "type", "is_read", "created_at")
    list_filter = ("type", "is_read", "page", "created_at")
    search_fields = ("owner__email", "title", "message")
    actions = ["mark_read", "mark_unread"]

    @admin.action(description="Mark selected notifications read")
    def mark_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected notifications unread")
    def mark_unread(self, request, queryset):
        queryset.update(is_read=False)
