from django.contrib import admin

from .models import Conversation, FriendRequest, Friendship, Message


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("from_user__email", "to_user__email")


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("user", "friend", "created_at")
    search_fields = ("user__email", "friend__email")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "is_group", "is_disabled_by_admin", "participant_count", "created_at", "updated_at")
    list_filter = ("is_group", "is_disabled_by_admin", "created_at", "updated_at")
    search_fields = ("title", "participants__email", "participants__full_name")
    filter_horizontal = ("participants",)
    actions = ["disable_conversations", "enable_conversations"]

    def participant_count(self, obj):
        return obj.participants.count()

    @admin.action(description="Disable selected conversations")
    def disable_conversations(self, request, queryset):
        queryset.update(is_disabled_by_admin=True)

    @admin.action(description="Enable selected conversations")
    def enable_conversations(self, request, queryset):
        queryset.update(is_disabled_by_admin=False)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "has_attachment", "is_removed_by_admin", "created_at")
    list_filter = ("is_removed_by_admin", "attachment_content_type", "created_at")
    search_fields = ("sender__email", "sender__full_name", "body", "attachment_name")
    actions = ["remove_messages", "restore_messages"]

    def has_attachment(self, obj):
        return bool(obj.attachment)

    @admin.action(description="Remove selected messages/shared files")
    def remove_messages(self, request, queryset):
        queryset.update(is_removed_by_admin=True)

    @admin.action(description="Restore selected messages/shared files")
    def restore_messages(self, request, queryset):
        queryset.update(is_removed_by_admin=False)
