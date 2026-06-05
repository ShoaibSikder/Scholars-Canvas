from django.urls import path

from .views import (
    AdminAIDocumentDetailView,
    AdminAIView,
    AdminAuditLogsView,
    AdminCommunicationView,
    AdminConversationDetailView,
    AdminMessageDetailView,
    AdminModerationView,
    AdminNotificationsView,
    AdminOverviewView,
    AdminReportDetailView,
    AdminResourceDetailView,
    AdminResourcesView,
    AdminSettingsView,
    AdminTasksRoutineView,
    AdminUserDetailView,
    AdminUsersView,
)

urlpatterns = [
    path("overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("users/", AdminUsersView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("resources/", AdminResourcesView.as_view(), name="admin-resources"),
    path("resources/<int:pk>/", AdminResourceDetailView.as_view(), name="admin-resource-detail"),
    path("ai/", AdminAIView.as_view(), name="admin-ai"),
    path("ai/documents/<int:pk>/", AdminAIDocumentDetailView.as_view(), name="admin-ai-document-detail"),
    path("communication/", AdminCommunicationView.as_view(), name="admin-communication"),
    path("communication/conversations/<int:pk>/", AdminConversationDetailView.as_view(), name="admin-conversation-detail"),
    path("communication/messages/<int:pk>/", AdminMessageDetailView.as_view(), name="admin-message-detail"),
    path("moderation/", AdminModerationView.as_view(), name="admin-moderation"),
    path("moderation/reports/<int:pk>/", AdminReportDetailView.as_view(), name="admin-report-detail"),
    path("tasks-routine/", AdminTasksRoutineView.as_view(), name="admin-tasks-routine"),
    path("notifications/", AdminNotificationsView.as_view(), name="admin-notifications"),
    path("settings/", AdminSettingsView.as_view(), name="admin-settings"),
    path("audit-logs/", AdminAuditLogsView.as_view(), name="admin-audit-logs"),
]
