from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, FriendRequest, Friendship, Message

User = get_user_model()


class UserCardSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    relationship_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "university", "major", "current_semester", "avatar_url", "relationship_status"]

    def get_name(self, obj):
        return obj.full_name or obj.email

    def get_avatar_url(self, obj):
        if not getattr(obj, "avatar", None):
            return ""

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url

    def get_relationship_status(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or user.id == obj.id:
            return "self"

        if Friendship.objects.filter(user=user, friend=obj).exists():
            return "friend"
        if FriendRequest.objects.filter(from_user=user, to_user=obj, status=FriendRequest.PENDING).exists():
            return "sent"
        if FriendRequest.objects.filter(from_user=obj, to_user=user, status=FriendRequest.PENDING).exists():
            return "incoming"
        return "none"


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserCardSerializer(read_only=True)
    to_user = UserCardSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user", "status", "created_at", "updated_at"]


class FriendshipSerializer(serializers.ModelSerializer):
    friend = UserCardSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ["id", "friend", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserCardSerializer(read_only=True)
    attachment_url = serializers.SerializerMethodField()
    is_deleted = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "body",
            "attachment_url",
            "attachment_name",
            "attachment_size",
            "attachment_content_type",
            "created_at",
            "edited_at",
            "deleted_at",
            "is_deleted",
            "is_edited",
        ]

    def get_attachment_url(self, obj):
        if obj.deleted_at or not obj.attachment:
            return ""
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url

    def get_is_deleted(self, obj):
        return bool(obj.deleted_at)

    def get_is_edited(self, obj):
        return bool(obj.edited_at and not obj.deleted_at)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.deleted_at:
            data.update(
                {
                    "body": "",
                    "attachment_url": "",
                    "attachment_name": "",
                    "attachment_size": 0,
                    "attachment_content_type": "",
                }
            )
        return data


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserCardSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "title", "is_group", "participants", "last_message", "created_at", "updated_at"]

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        return MessageSerializer(message, context=self.context).data if message else None
