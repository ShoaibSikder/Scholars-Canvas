from django.urls import path

from .consumers import ConversationConsumer

websocket_urlpatterns = [
    path("ws/communication/conversations/<int:conversation_id>/", ConversationConsumer.as_asgi()),
]
