from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.storage_paths import communication_upload_path


class FriendRequest(models.Model):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    STATUS_CHOICES = (
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
    )

    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_friend_requests")
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_friend_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["from_user", "to_user"], condition=Q(status="pending"), name="unique_pending_friend_request"),
            models.CheckConstraint(condition=~Q(from_user=models.F("to_user")), name="friend_request_not_self"),
        ]

    def __str__(self):
        return f"{self.from_user.email} -> {self.to_user.email} ({self.status})"


class Friendship(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendships")
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friend_of")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "friend"], name="unique_friendship_direction"),
            models.CheckConstraint(condition=~Q(user=models.F("friend")), name="friendship_not_self"),
        ]

    def __str__(self):
        return f"{self.user.email} friends {self.friend.email}"


class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="communication_conversations")
    title = models.CharField(max_length=160, blank=True)
    is_group = models.BooleanField(default=False)
    is_disabled_by_admin = models.BooleanField(default=False)
    moderation_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation {self.pk}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField(blank=True)
    attachment = models.FileField(upload_to=communication_upload_path, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)
    attachment_size = models.PositiveIntegerField(default=0)
    attachment_content_type = models.CharField(max_length=120, blank=True)
    is_removed_by_admin = models.BooleanField(default=False)
    moderation_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email}: {self.body[:40]}"


class MessageRead(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reads")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="read_communication_messages")
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["read_at"]
        constraints = [
            models.UniqueConstraint(fields=["message", "user"], name="unique_message_read_user"),
        ]

    def __str__(self):
        return f"{self.user_id} read message {self.message_id}"


class TypingIndicator(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="typing_indicators")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="communication_typing_indicators")
    is_typing = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["conversation", "user"], name="unique_conversation_typing_user"),
        ]

    def __str__(self):
        return f"{self.user_id} typing in {self.conversation_id}: {self.is_typing}"
