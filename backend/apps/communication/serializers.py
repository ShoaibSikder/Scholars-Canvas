from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.media_urls import request_media_url

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

        return request_media_url(self.context.get("request"), obj.avatar)

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
    is_seen = serializers.SerializerMethodField()
    seen_at = serializers.SerializerMethodField()
    read_by_count = serializers.SerializerMethodField()

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
            "is_seen",
            "seen_at",
            "read_by_count",
        ]

    def get_attachment_url(self, obj):
        if obj.deleted_at or not obj.attachment:
            return ""
        return request_media_url(self.context.get("request"), obj.attachment)

    def get_is_deleted(self, obj):
        return bool(obj.deleted_at)

    def get_is_edited(self, obj):
        return bool(obj.edited_at and not obj.deleted_at)

    def get_is_seen(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or obj.sender_id != getattr(user, "id", None):
            return False
        participant_ids = set(obj.conversation.participants.exclude(id=obj.sender_id).values_list("id", flat=True))
        if not participant_ids:
            return False
        read_user_ids = set(obj.reads.values_list("user_id", flat=True))
        return participant_ids.issubset(read_user_ids)

    def get_seen_at(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or obj.sender_id != getattr(user, "id", None):
            return None
        participant_ids = set(obj.conversation.participants.exclude(id=obj.sender_id).values_list("id", flat=True))
        if not participant_ids:
            return None
        reads = list(obj.reads.filter(user_id__in=participant_ids).order_by("read_at"))
        if len({read.user_id for read in reads}) < len(participant_ids):
            return None
        return reads[-1].read_at if reads else None

    def get_read_by_count(self, obj):
        return obj.reads.exclude(user_id=obj.sender_id).count()

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
