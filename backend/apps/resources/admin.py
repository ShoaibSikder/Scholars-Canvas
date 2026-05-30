from django.contrib import admin

from .models import VaultCourse, VaultResource


class VaultResourceInline(admin.TabularInline):
    model = VaultResource
    extra = 0


@admin.register(VaultCourse)
class VaultCourseAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "semester", "user", "updated_at")
    list_filter = ("semester",)
    search_fields = ("code", "title", "user__email")
    inlines = [VaultResourceInline]


@admin.register(VaultResource)
class VaultResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "category", "resource_type", "created_at")
    list_filter = ("category", "resource_type")
    search_fields = ("title", "course__code", "course__title", "course__user__email")
