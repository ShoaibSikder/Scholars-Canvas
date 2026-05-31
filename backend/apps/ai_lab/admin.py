from django.contrib import admin

from .models import AIStudyDocument


@admin.register(AIStudyDocument)
class AIStudyDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "owner", "updated_at")
    search_fields = ("title", "course", "owner__email")
    list_filter = ("course", "updated_at")
