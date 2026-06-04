from django.contrib import admin

from .models import VaultCourse, VaultResource


class VaultResourceInline(admin.TabularInline):
    model = VaultResource
    extra = 0


@admin.register(VaultCourse)
class VaultCourseAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "semester", "user", "resource_count", "updated_at")
    list_filter = ("semester", "user__university")
    search_fields = ("code", "title", "user__email", "user__full_name", "user__university")
    inlines = [VaultResourceInline]

    def resource_count(self, obj):
        return obj.resources.count()


@admin.register(VaultResource)
class VaultResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "owner", "category", "resource_type", "file_size", "is_public", "moderation_status", "created_at")
    list_filter = ("category", "resource_type", "is_public", "public_access_revoked", "is_removed_by_admin", "moderation_status", "created_at")
    search_fields = ("title", "course__code", "course__title", "course__user__email", "course__user__full_name", "notes")
    readonly_fields = ("file_size", "created_at", "updated_at")
    actions = ["revoke_public_access", "remove_resources", "restore_resources"]

    def owner(self, obj):
        return obj.course.user

    @admin.action(description="Revoke public/shared access")
    def revoke_public_access(self, request, queryset):
        queryset.update(is_public=False, public_access_revoked=True)

    @admin.action(description="Mark selected resources removed")
    def remove_resources(self, request, queryset):
        queryset.update(is_removed_by_admin=True, moderation_status="removed")

    @admin.action(description="Restore selected resources")
    def restore_resources(self, request, queryset):
        queryset.update(is_removed_by_admin=False, moderation_status="active")
