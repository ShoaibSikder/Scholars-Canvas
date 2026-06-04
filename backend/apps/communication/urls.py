from django.urls import path

from .views import CommunicationOverviewView, ConversationView, FriendRequestActionView, FriendRequestView, MessageDetailView, MessageView, UserSearchView

urlpatterns = [
    path("", CommunicationOverviewView.as_view(), name="communication-overview"),
    path("search-users/", UserSearchView.as_view(), name="communication-user-search"),
    path("friend-requests/", FriendRequestView.as_view(), name="communication-friend-request"),
    path("friend-requests/<int:pk>/", FriendRequestActionView.as_view(), name="communication-friend-request-action"),
    path("conversations/", ConversationView.as_view(), name="communication-conversations"),
    path("conversations/<int:conversation_id>/messages/", MessageView.as_view(), name="communication-messages"),
    path("conversations/<int:conversation_id>/messages/<int:message_id>/", MessageDetailView.as_view(), name="communication-message-detail"),
]
