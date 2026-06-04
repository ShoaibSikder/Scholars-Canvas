from django.contrib import admin

from .models import AIStudyDocument


@admin.register(AIStudyDocument)
class AIStudyDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "owner", "ai_processing_allowed", "request_count", "provider", "model_name", "updated_at")
    search_fields = ("title", "course", "owner__email", "owner__full_name", "last_error")
    list_filter = ("course", "ai_processing_allowed", "provider", "model_name", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    actions = ["disable_ai_processing", "enable_ai_processing"]

    @admin.action(description="Disable AI processing for selected documents")
    def disable_ai_processing(self, request, queryset):
        queryset.update(ai_processing_allowed=False)

    @admin.action(description="Enable AI processing for selected documents")
    def enable_ai_processing(self, request, queryset):
        queryset.update(ai_processing_allowed=True)
