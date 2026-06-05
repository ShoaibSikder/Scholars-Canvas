import re

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notification.models import Notification
from apps.administration.utils import setting_value
from apps.db_safety import parse_positive_int

from .models import Conversation, FriendRequest, Friendship, Message, MessageRead
from .serializers import ConversationSerializer, FriendRequestSerializer, FriendshipSerializer, MessageSerializer, UserCardSerializer

User = get_user_model()


def is_admin_account(user):
    return bool(user.is_staff or user.is_superuser or getattr(user, "is_admin_role", False))


def messaging_disabled_response():
    return Response({"message": "You cannot use chat because an admin turned off chat access for your account."}, status=status.HTTP_403_FORBIDDEN)


def student_users():
    return User.objects.filter(is_staff=False, is_superuser=False, role=User.Role.STUDENT)


def friend_ids_for(user):
    return list(Friendship.objects.filter(user=user).values_list("friend_id", flat=True))


def excluded_connection_ids_for(user):
    incoming = FriendRequest.objects.filter(to_user=user, status=FriendRequest.PENDING)
    outgoing = FriendRequest.objects.filter(from_user=user, status=FriendRequest.PENDING)
    excluded_ids = set(friend_ids_for(user))
    excluded_ids.add(user.id)
    excluded_ids.update(outgoing.values_list("to_user_id", flat=True))
    excluded_ids.update(incoming.values_list("from_user_id", flat=True))
    return excluded_ids


def are_friends(user, other_user):
    return Friendship.objects.filter(user=user, friend=other_user).exists()


def get_or_create_conversation(user, friend):
    conversations = Conversation.objects.filter(is_group=False, participants=user).filter(participants=friend)
    conversation = conversations.first()
    if conversation:
        return conversation

    conversation = Conversation.objects.create()
    conversation.participants.add(user, friend)
    return conversation


def user_label(user):
    return user.full_name or user.email


def create_notification(owner, title, message, notification_type=Notification.Type.MESSAGE, page="communication", source_key=""):
    defaults = {
        "title": title,
        "message": message,
        "type": notification_type,
        "page": page,
    }

    if source_key:
        Notification.objects.get_or_create(owner=owner, source_key=source_key, defaults=defaults)
        return

    Notification.objects.create(owner=owner, **defaults)


def broadcast_conversation_event(conversation_id, event, payload):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        f"communication_{conversation_id}",
        {
            "type": "communication.message",
            "event": event,
            **payload,
        },
    )


def broadcast_read_event(conversation_id, reader_id, message_ids):
    if not message_ids:
        return
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        f"communication_{conversation_id}",
        {
            "type": "communication.read",
            "reader_id": reader_id,
            "message_ids": message_ids,
        },
    )


def validate_upload_for_user(user, uploaded_file):
    if not uploaded_file:
        return ""
    allowed = setting_value("allowed_upload_file_extensions", [])
    if isinstance(allowed, str):
        allowed = [item.strip() for item in allowed.split(",") if item.strip()]
    extension = "." + uploaded_file.name.rsplit(".", 1)[-1].lower() if "." in uploaded_file.name else ""
    if allowed and extension not in {item.lower() for item in allowed}:
        return "This file type is not allowed."
    upload_limit_mb = user.upload_limit_mb or setting_value("max_upload_size_mb", 25)
    if upload_limit_mb and getattr(uploaded_file, "size", 0) > upload_limit_mb * 1024 * 1024:
        return f"File exceeds your {upload_limit_mb} MB upload limit."
    return ""


def suggested_users_for(user, limit=12):
    if is_admin_account(user):
        return []

    excluded_ids = excluded_connection_ids_for(user)
    my_friend_ids = set(friend_ids_for(user))
    friends_of_friends = Friendship.objects.filter(user_id__in=my_friend_ids).exclude(friend=user).values_list("friend_id", flat=True)

    candidate_ids = set(friends_of_friends)
    profile_matches = student_users().exclude(id__in=excluded_ids).filter(
        Q(university__iexact=user.university)
        | Q(major__iexact=user.major)
        | Q(current_semester=user.current_semester)
    ).values_list("id", flat=True)
    candidate_ids.update(profile_matches)
    candidate_ids.difference_update(excluded_ids)

    candidates = student_users().filter(id__in=candidate_ids)
    scored = []
    for candidate in candidates:
        mutual_count = Friendship.objects.filter(user=candidate, friend_id__in=my_friend_ids).count()
        score = mutual_count * 5
        if user.university and candidate.university and candidate.university.lower() == user.university.lower():
            score += 4
        if user.major and candidate.major and candidate.major.lower() == user.major.lower():
            score += 3
        if user.current_semester and candidate.current_semester == user.current_semester:
            score += 2
        scored.append((score, candidate.full_name or candidate.email, candidate))

    scored.sort(key=lambda item: (-item[0], item[1].lower()))
    return [candidate for _, __, candidate in scored[:limit]]


class CommunicationOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        user = request.user
        friends = Friendship.objects.filter(
            user=user,
            friend__is_staff=False,
            friend__is_superuser=False,
            friend__role=User.Role.STUDENT,
        ).select_related("friend")
        incoming = FriendRequest.objects.filter(
            to_user=user,
            from_user__is_staff=False,
            from_user__is_superuser=False,
            from_user__role=User.Role.STUDENT,
            status=FriendRequest.PENDING,
        ).select_related("from_user", "to_user")
        outgoing = FriendRequest.objects.filter(
            from_user=user,
            to_user__is_staff=False,
            to_user__is_superuser=False,
            to_user__role=User.Role.STUDENT,
            status=FriendRequest.PENDING,
        ).select_related("from_user", "to_user")
        conversations = Conversation.objects.filter(participants=user).exclude(
            participants__is_staff=True,
        ).exclude(
            participants__is_superuser=True,
        ).exclude(
            participants__role__in=[User.Role.SUPPORT_ADMIN, User.Role.MODERATOR, User.Role.SUPER_ADMIN],
        ).prefetch_related("participants", "messages")

        suggestions = suggested_users_for(user)

        return Response(
            {
                "friends": FriendshipSerializer(friends, many=True, context={"request": request}).data,
                "incoming_requests": FriendRequestSerializer(incoming, many=True, context={"request": request}).data,
                "outgoing_requests": FriendRequestSerializer(outgoing, many=True, context={"request": request}).data,
                "suggestions": UserCardSerializer(suggestions, many=True, context={"request": request}).data,
                "conversations": ConversationSerializer(conversations, many=True, context={"request": request}).data,
            }
        )


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if is_admin_account(request.user):
            return Response({"users": []})
        if request.user.messaging_disabled:
            return messaging_disabled_response()

        query = (request.query_params.get("q") or "").strip()
        if not query:
            return Response({"users": []})

        semester_match = re.search(r"\b(?:semester|sem|year)?\s*(\d{1,2})\b", query, flags=re.IGNORECASE)
        search_filter = (
            Q(full_name__icontains=query)
            | Q(email__icontains=query)
            | Q(university__icontains=query)
            | Q(major__icontains=query)
        )
        if semester_match:
            search_filter |= Q(current_semester=int(semester_match.group(1)))

        users = (
            student_users().exclude(id=request.user.id)
            .filter(search_filter)
            .distinct()[:20]
        )
        return Response({"users": UserCardSerializer(users, many=True, context={"request": request}).data})


class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        to_user_id = parse_positive_int(request.data.get("to_user_id"), field_name="to_user_id")
        to_user = User.objects.filter(id=to_user_id).first()

        if not to_user or to_user == request.user or is_admin_account(to_user):
            return Response({"message": "User not found."}, status=status.HTTP_400_BAD_REQUEST)
        if are_friends(request.user, to_user):
            return Response({"message": "You are already friends."}, status=status.HTTP_400_BAD_REQUEST)
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user, status=FriendRequest.PENDING).exists():
            return Response({"message": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

        friend_request = FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        create_notification(
            to_user,
            "New friend request",
            f"{user_label(request.user)} sent you a friend request.",
            notification_type=Notification.Type.MESSAGE,
            source_key=f"friend-request-{friend_request.id}",
        )
        return Response({"message": "Friend request sent.", "request": FriendRequestSerializer(friend_request, context={"request": request}).data}, status=status.HTTP_201_CREATED)


class FriendRequestActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        action = request.data.get("action")

        if action == "cancel":
            friend_request = FriendRequest.objects.filter(pk=pk, from_user=request.user, status=FriendRequest.PENDING).first()
            if not friend_request:
                return Response({"message": "Sent friend request not found."}, status=status.HTTP_404_NOT_FOUND)
            friend_request.status = FriendRequest.REJECTED
            friend_request.save(update_fields=["status", "updated_at"])
            return Response({"message": "Friend request cancelled."})

        friend_request = FriendRequest.objects.filter(pk=pk, to_user=request.user, status=FriendRequest.PENDING).select_related("from_user", "to_user").first()

        if not friend_request:
            return Response({"message": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)
        if is_admin_account(friend_request.from_user) or is_admin_account(friend_request.to_user):
            return Response({"message": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            with transaction.atomic():
                friend_request.status = FriendRequest.ACCEPTED
                friend_request.save(update_fields=["status", "updated_at"])
                Friendship.objects.get_or_create(user=friend_request.from_user, friend=friend_request.to_user)
                Friendship.objects.get_or_create(user=friend_request.to_user, friend=friend_request.from_user)
                conversation = get_or_create_conversation(friend_request.from_user, friend_request.to_user)
                create_notification(
                    friend_request.from_user,
                    "Friend request accepted",
                    f"{user_label(friend_request.to_user)} accepted your friend request.",
                    notification_type=Notification.Type.SUCCESS,
                    source_key=f"friend-accepted-{friend_request.id}",
                )
                create_notification(
                    friend_request.to_user,
                    "Friend request accepted",
                    f"You accepted {user_label(friend_request.from_user)}'s friend request.",
                    notification_type=Notification.Type.SUCCESS,
                    source_key=f"friend-accepted-by-you-{friend_request.id}",
                )
            return Response({"message": "Friend request accepted.", "conversation": ConversationSerializer(conversation, context={"request": request}).data})

        if action == "reject":
            friend_request.status = FriendRequest.REJECTED
            friend_request.save(update_fields=["status", "updated_at"])
            return Response({"message": "Friend request rejected."})

        return Response({"message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        conversations = Conversation.objects.filter(participants=request.user).prefetch_related("participants", "messages")
        return Response({"conversations": ConversationSerializer(conversations, many=True, context={"request": request}).data})

    def post(self, request):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        participant_ids = request.data.get("participant_ids")
        if isinstance(participant_ids, list):
            participant_ids = {int(user_id) for user_id in participant_ids if str(user_id).isdigit()}
            participant_ids.add(request.user.id)
            if len(participant_ids) < 3:
                return Response({"message": "Choose at least two friends to create a group."}, status=status.HTTP_400_BAD_REQUEST)

            friends = set(friend_ids_for(request.user))
            if not participant_ids.difference({request.user.id}).issubset(friends):
                return Response({"message": "Groups can only include your friends."}, status=status.HTTP_400_BAD_REQUEST)
            if student_users().filter(id__in=participant_ids).count() != len(participant_ids):
                return Response({"message": "Groups can only include normal user accounts."}, status=status.HTTP_400_BAD_REQUEST)

            title = (request.data.get("title") or "").strip()
            group_limit = setting_value("group_chat_creation_limit", 10)
            existing_groups = Conversation.objects.filter(is_group=True, participants=request.user).count()
            group_limit = parse_positive_int(group_limit, minimum=0, allow_none=True, field_name="group_chat_creation_limit")
            if group_limit and existing_groups >= group_limit:
                return Response({"message": "Group chat creation limit reached."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            with transaction.atomic():
                conversation = Conversation.objects.create(title=title[:160], is_group=True)
                conversation.participants.add(*User.objects.filter(id__in=participant_ids))
            return Response({"conversation": ConversationSerializer(conversation, context={"request": request}).data}, status=status.HTTP_201_CREATED)

        friend_id = parse_positive_int(request.data.get("friend_id"), field_name="friend_id")
        friend = User.objects.filter(id=friend_id).first()

        if not friend or is_admin_account(friend) or not are_friends(request.user, friend):
            return Response({"message": "You can only chat with friends."}, status=status.HTTP_400_BAD_REQUEST)

        conversation = get_or_create_conversation(request.user, friend)
        return Response({"conversation": ConversationSerializer(conversation, context={"request": request}).data})


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, conversation_id):
        if is_admin_account(request.user):
            return None
        return Conversation.objects.filter(id=conversation_id, participants=request.user).first()

    def get(self, request, conversation_id):
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        conversation = self.get_conversation(request, conversation_id)
        if not conversation:
            return Response({"message": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        unread_messages = list(conversation.messages.exclude(sender=request.user).exclude(reads__user=request.user))
        MessageRead.objects.bulk_create(
            [MessageRead(message=message, user=request.user) for message in unread_messages],
            ignore_conflicts=True,
        )
        broadcast_read_event(conversation.id, request.user.id, [message.id for message in unread_messages])
        messages = conversation.messages.select_related("sender").prefetch_related("reads", "conversation__participants")
        return Response({"messages": MessageSerializer(messages, many=True, context={"request": request}).data})

    def post(self, request, conversation_id):
        if is_admin_account(request.user):
            return Response({"message": "Communication is available only for normal user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        conversation = self.get_conversation(request, conversation_id)
        body = (request.data.get("body") or "").strip()
        attachment = request.FILES.get("attachment")

        if not conversation:
            return Response({"message": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        if conversation.is_disabled_by_admin:
            return Response({"message": "This conversation has been disabled."}, status=status.HTTP_403_FORBIDDEN)
        if not body and not attachment:
            return Response({"message": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        upload_error = validate_upload_for_user(request.user, attachment)
        if upload_error:
            return Response({"message": upload_error}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            body=body,
            attachment=attachment,
            attachment_name=getattr(attachment, "name", "") if attachment else "",
            attachment_size=getattr(attachment, "size", 0) if attachment else 0,
            attachment_content_type=getattr(attachment, "content_type", "") if attachment else "",
        )

        conversation.save(update_fields=["updated_at"])
        preview_source = body or f"Sent a file: {message.attachment_name}"
        preview = preview_source[:90] + ("..." if len(preview_source) > 90 else "")
        for participant in conversation.participants.exclude(id=request.user.id):
            create_notification(
                participant,
                f"New message from {user_label(request.user)}",
                preview,
                notification_type=Notification.Type.MESSAGE,
                source_key=f"message-{message.id}-to-{participant.id}",
            )
        serialized_message = MessageSerializer(message, context={"request": request}).data
        broadcast_conversation_event(conversation.id, "message.created", {"message": serialized_message})
        return Response({"message": serialized_message}, status=status.HTTP_201_CREATED)


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_message(self, request, conversation_id, message_id):
        if is_admin_account(request.user):
            return None

        return Message.objects.filter(
            id=message_id,
            conversation_id=conversation_id,
            conversation__participants=request.user,
        ).select_related("sender", "conversation").first()

    def patch(self, request, conversation_id, message_id):
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        message = self.get_message(request, conversation_id, message_id)
        body = (request.data.get("body") or "").strip()

        if not message:
            return Response({"message": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        if message.sender_id != request.user.id:
            return Response({"message": "You can only edit your own messages."}, status=status.HTTP_403_FORBIDDEN)
        if message.deleted_at:
            return Response({"message": "Unsent messages cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)
        if not body:
            return Response({"message": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        message.body = body
        message.edited_at = timezone.now()
        message.save(update_fields=["body", "edited_at"])
        message.conversation.save(update_fields=["updated_at"])
        serialized_message = MessageSerializer(message, context={"request": request}).data
        broadcast_conversation_event(message.conversation_id, "message.updated", {"message": serialized_message})
        return Response({"message": serialized_message})

    def delete(self, request, conversation_id, message_id):
        if request.user.messaging_disabled:
            return messaging_disabled_response()
        message = self.get_message(request, conversation_id, message_id)

        if not message:
            return Response({"message": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        if message.sender_id != request.user.id:
            return Response({"message": "You can only unsend your own messages."}, status=status.HTTP_403_FORBIDDEN)
        if not message.deleted_at:
            message.body = ""
            message.deleted_at = timezone.now()
            message.save(update_fields=["body", "deleted_at"])
            message.conversation.save(update_fields=["updated_at"])

        serialized_message = MessageSerializer(message, context={"request": request}).data
        broadcast_conversation_event(message.conversation_id, "message.deleted", {"message": serialized_message})
        return Response({"message": serialized_message})
