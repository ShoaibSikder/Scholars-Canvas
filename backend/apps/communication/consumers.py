from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from .models import Conversation, Message, MessageRead, TypingIndicator
from .serializers import UserCardSerializer
from .views import is_admin_account

User = get_user_model()


class ConversationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"communication_{self.conversation_id}"
        self.user = await self.get_user_from_token()

        if not self.user or not await self.can_join_conversation():
            await self.close(code=4401)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if getattr(self, "user", None) and getattr(self, "group_name", None):
            await self.set_typing(False)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "communication.typing",
                    "user": await self.serialize_user(),
                    "is_typing": False,
                },
            )
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action")

        if action == "typing":
            is_typing = bool(content.get("is_typing"))
            await self.set_typing(is_typing)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "communication.typing",
                    "user": await self.serialize_user(),
                    "is_typing": is_typing,
                },
            )
            return

        if action == "read":
            message_ids = content.get("message_ids") or []
            read_ids = await self.mark_messages_read(message_ids)
            if read_ids:
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "communication.read",
                        "reader_id": self.user.id,
                        "message_ids": read_ids,
                    },
                )

    async def communication_message(self, event):
        await self.send_json(
            {
                "type": event.get("event"),
                "message": event.get("message"),
            }
        )

    async def communication_read(self, event):
        await self.send_json(
            {
                "type": "messages.read",
                "reader_id": event.get("reader_id"),
                "message_ids": event.get("message_ids", []),
            }
        )

    async def communication_typing(self, event):
        user = event.get("user") or {}
        if user.get("id") == self.user.id:
            return
        await self.send_json(
            {
                "type": "typing",
                "user": user,
                "is_typing": event.get("is_typing", False),
            }
        )

    async def get_user_from_token(self):
        query = parse_qs(self.scope.get("query_string", b"").decode())
        token_key = (query.get("token") or [""])[0]
        if not token_key:
            return None
        return await sync_to_async(
            lambda: getattr(Token.objects.select_related("user").filter(key=token_key).first(), "user", None)
        )()

    async def can_join_conversation(self):
        if is_admin_account(self.user) or self.user.messaging_disabled:
            return False
        return await sync_to_async(
            Conversation.objects.filter(id=self.conversation_id, participants=self.user).exists
        )()

    async def serialize_user(self):
        return await sync_to_async(lambda: UserCardSerializer(self.user).data)()

    async def set_typing(self, is_typing):
        await sync_to_async(TypingIndicator.objects.update_or_create)(
            conversation_id=self.conversation_id,
            user=self.user,
            defaults={"is_typing": is_typing},
        )

    async def mark_messages_read(self, message_ids):
        clean_ids = [message_id for message_id in message_ids if str(message_id).isdigit()]
        if not clean_ids:
            return []
        messages = await sync_to_async(list)(
            Message.objects.filter(
                id__in=clean_ids,
                conversation_id=self.conversation_id,
            ).exclude(sender=self.user)
        )
        await sync_to_async(MessageRead.objects.bulk_create)(
            [MessageRead(message=message, user=self.user) for message in messages],
            ignore_conflicts=True,
        )
        return [message.id for message in messages]
