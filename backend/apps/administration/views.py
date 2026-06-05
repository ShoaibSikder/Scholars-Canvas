from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Max, Q, Sum, TextField
from django.db.models.functions import Cast
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_lab.models import AIStudyDocument
from apps.communication.models import Conversation, FriendRequest, Friendship, Message
from apps.courses.models import RoutineSlot
from apps.db_safety import parse_page_window, parse_positive_int
from apps.notification.models import Notification
from apps.resources.models import VaultCourse, VaultResource
from apps.tasks.models import StudySession, Task

from .models import AIUsageLog, AdminAuditLog, NotificationTemplate, Report, SystemAnnouncement, SystemSetting
from .serializers import (
    AdminAIStudyDocumentSerializer,
    AdminAIUsageLogSerializer,
    AdminAuditLogSerializer,
    AdminConversationSerializer,
    AdminMessageSerializer,
    AdminNotificationTemplateSerializer,
    AdminReportSerializer,
    AdminSystemAnnouncementSerializer,
    AdminSystemSettingSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    AdminVaultCourseSerializer,
    AdminVaultResourceSerializer,
)

User = get_user_model()


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_admin_role))


def audit(request, action, target="", obj=None, metadata=None):
    log = AdminAuditLog(
        actor=request.user,
        action=action,
        target_label=target or str(obj or ""),
        metadata=metadata or {},
    )
    if obj is not None:
        log.content_object = obj
    log.save()


def page(queryset, serializer_class, request, limit=20):
    limit, offset = parse_page_window(request.query_params, default_limit=limit, max_limit=100)
    total = queryset.count()
    serializer = serializer_class(queryset[offset : offset + limit], many=True, context={"request": request})
    return {"results": serializer.data, "total": total, "limit": limit, "offset": offset, "has_more": offset + limit < total}


def notify_feature_control(user, title, message, notification_type, page, source_key):
    Notification.objects.update_or_create(
        owner=user,
        source_key=source_key,
        defaults={
            "title": title,
            "message": message,
            "type": notification_type,
            "page": page,
            "is_read": False,
        },
    )


def notify_user_admin_action(user, title, message, notification_type=Notification.Type.INFO, page="", source_key=""):
    if not user:
        return
    Notification.objects.create(
        owner=user,
        title=title[:120],
        message=message,
        type=notification_type,
        page=page,
        source_key=source_key or f"admin-action-{user.pk}-{timezone.now().timestamp()}",
    )


def notify_users_admin_action(users, title, message, notification_type=Notification.Type.INFO, page="", source_key_prefix="admin-action"):
    batch = timezone.now().strftime("%Y%m%d%H%M%S%f")
    Notification.objects.bulk_create(
        [
            Notification(
                owner=user,
                title=title[:120],
                message=message,
                type=notification_type,
                page=page,
                source_key=f"{source_key_prefix}-{batch}-{user.pk}",
            )
            for user in users
            if getattr(user, "is_active", False)
        ],
        ignore_conflicts=True,
    )


def describe_setting_value(value):
    if isinstance(value, dict) and "value" in value:
        value = value["value"]
    if isinstance(value, bool):
        return "on" if value else "off"
    if isinstance(value, list):
        return ", ".join(str(item) for item in value) or "empty"
    return str(value)


def normalize_system_setting_value(setting, value):
    if setting.setting_type == SystemSetting.SettingType.INTEGER:
        if isinstance(value, bool):
            raise serializers.ValidationError({"value": f"{setting.label} must be a number."})
        try:
            return int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError({"value": f"{setting.label} must be a number."})
    if setting.setting_type == SystemSetting.SettingType.BOOLEAN:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on"}:
                return True
            if normalized in {"0", "false", "no", "off"}:
                return False
        raise serializers.ValidationError({"value": f"{setting.label} must be true or false."})
    if setting.setting_type == SystemSetting.SettingType.STRING:
        return "" if value is None else str(value)
    return value


class AdminOverviewView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=6)
        storage_used = VaultResource.objects.aggregate(total=Sum("file_size"))["total"] or 0
        ai_total = AIUsageLog.objects.count()
        ai_failed = AIUsageLog.objects.filter(status=AIUsageLog.Status.FAILED).count()
        return Response(
            {
                "metrics": {
                    "total_users": User.objects.count(),
                    "active_users": User.objects.filter(is_active=True, account_status=User.AccountStatus.ACTIVE).count(),
                    "new_registrations": User.objects.filter(date_joined__date=today).count(),
                    "storage_used_mb": round(storage_used / 1024 / 1024, 2),
                    "ai_usage_count": ai_total,
                    "ai_failure_rate": round((ai_failed / ai_total) * 100, 1) if ai_total else 0,
                    "open_reports": Report.objects.filter(status=Report.Status.OPEN).count(),
                    "failed_notifications": 0,
                },
                "feature_usage": [
                    {"label": "Vault", "value": VaultResource.objects.count()},
                    {"label": "AI Lab", "value": AIStudyDocument.objects.count() + ai_total},
                    {"label": "Tasks", "value": Task.objects.count()},
                    {"label": "Routine", "value": RoutineSlot.objects.count()},
                    {"label": "Communication", "value": Message.objects.count()},
                ],
                "file_types": list(VaultResource.objects.values("resource_type").annotate(value=Count("id")).order_by("-value")),
                "activity": [
                    {
                        "date": (week_start + timezone.timedelta(days=index)).isoformat(),
                        "users": User.objects.filter(last_login__date=week_start + timezone.timedelta(days=index)).count(),
                        "ai": AIUsageLog.objects.filter(created_at__date=week_start + timezone.timedelta(days=index)).count(),
                        "uploads": VaultResource.objects.filter(created_at__date=week_start + timezone.timedelta(days=index)).count(),
                    }
                    for index in range(7)
                ],
            }
        )


class AdminUsersView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        users = User.objects.annotate(
            course_count=Count("vault_courses", distinct=True),
            task_count=Count("tasks", distinct=True),
            resource_count=Count("vault_courses__resources", distinct=True),
            storage_used=Sum("vault_courses__resources__file_size"),
        ).order_by("-date_joined")
        if query:
            users = users.filter(Q(email__icontains=query) | Q(full_name__icontains=query) | Q(university__icontains=query) | Q(major__icontains=query))
        return Response(page(users, AdminUserSerializer, request, limit=30))

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        audit(request, "user_created", user.email, user, {"role": user.role})
        notify_user_admin_action(
            user,
            "Account created",
            f"An admin created your Scholars Canvas account as {user.get_role_display()}.",
            Notification.Type.SUCCESS,
            "settings",
        )
        return Response({"user": AdminUserSerializer(user).data}, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        user = User.objects.get(pk=pk)
        if user.pk == request.user.pk:
            protected_fields = {"account_status", "is_active", "is_staff", "role"}
            if protected_fields.intersection(request.data.keys()):
                return Response({"message": "You cannot change your own admin access or account status."}, status=status.HTTP_400_BAD_REQUEST)
        old_ai_enabled = user.ai_features_enabled
        old_messaging_disabled = user.messaging_disabled
        old_role = user.role
        old_account_status = user.account_status
        old_is_active = user.is_active
        old_daily_ai_limit = user.daily_ai_limit
        old_monthly_ai_limit = user.monthly_ai_limit
        old_upload_limit_mb = user.upload_limit_mb
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "role" in serializer.validated_data and not user.is_superuser:
            user.is_staff = user.is_admin_role
            user.save(update_fields=["is_staff"])
        if "ai_features_enabled" in serializer.validated_data and old_ai_enabled != user.ai_features_enabled:
            if user.ai_features_enabled:
                notify_feature_control(
                    user,
                    "AI access restored",
                    "An admin turned AI access back on for your account.",
                    Notification.Type.SUCCESS,
                    "ai-lab",
                    f"admin-ai-enabled-{user.pk}",
                )
            else:
                notify_feature_control(
                    user,
                    "AI disabled by admin",
                    "An admin turned off AI access for your account. You cannot use AI tools until an admin turns it back on.",
                    Notification.Type.AI,
                    "ai-lab",
                    f"admin-ai-disabled-{user.pk}",
                )
        if "messaging_disabled" in serializer.validated_data and old_messaging_disabled != user.messaging_disabled:
            if user.messaging_disabled:
                notify_feature_control(
                    user,
                    "Chat disabled by admin",
                    "An admin turned off chat access for your account. You cannot use chat until an admin turns it back on.",
                    Notification.Type.MESSAGE,
                    "communication",
                    f"admin-chat-disabled-{user.pk}",
                )
            else:
                notify_feature_control(
                    user,
                    "Chat access restored",
                    "An admin turned chat access back on for your account.",
                    Notification.Type.SUCCESS,
                    "communication",
                    f"admin-chat-enabled-{user.pk}",
                )
        changes = []
        if "role" in serializer.validated_data and old_role != user.role:
            changes.append(f"your access role changed to {user.get_role_display()}")
        if "account_status" in serializer.validated_data and old_account_status != user.account_status:
            changes.append(f"your account status changed to {user.get_account_status_display()}")
        if "is_active" in serializer.validated_data and old_is_active != user.is_active:
            changes.append("your account was activated" if user.is_active else "your account was deactivated")
        if "daily_ai_limit" in serializer.validated_data and old_daily_ai_limit != user.daily_ai_limit:
            changes.append(f"your daily AI limit is now {user.daily_ai_limit or 'default'}")
        if "monthly_ai_limit" in serializer.validated_data and old_monthly_ai_limit != user.monthly_ai_limit:
            changes.append(f"your monthly AI limit is now {user.monthly_ai_limit or 'default'}")
        if "upload_limit_mb" in serializer.validated_data and old_upload_limit_mb != user.upload_limit_mb:
            changes.append(f"your upload limit is now {user.upload_limit_mb or 'default'} MB")
        profile_fields = {"full_name", "university", "major", "current_semester", "institutional_email_verified", "suspension_reason"}
        if profile_fields.intersection(serializer.validated_data.keys()):
            changes.append("your account details were updated")
        if changes:
            notify_user_admin_action(
                user,
                "Account updated by admin",
                f"An admin updated your account: {', '.join(changes)}.",
                Notification.Type.INFO,
                "settings",
            )
        audit(request, "user_updated", user.email, user, serializer.validated_data)
        return Response({"user": AdminUserSerializer(user).data})

    def post(self, request, pk):
        user = User.objects.get(pk=pk)
        action = request.data.get("action")
        if action == "suspend":
            if user.pk == request.user.pk:
                return Response({"message": "You cannot suspend your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
            notify_user_admin_action(
                user,
                "Account suspended by admin",
                "An admin suspended your account. Please contact support if you think this is a mistake.",
                Notification.Type.WARNING,
                "settings",
            )
            user.account_status = User.AccountStatus.SUSPENDED
            user.is_active = False
            user.force_logout_after = timezone.now()
            Token.objects.filter(user=user).delete()
        elif action == "activate":
            user.account_status = User.AccountStatus.ACTIVE
            user.is_active = True
            notify_user_admin_action(
                user,
                "Account reactivated",
                "An admin reactivated your account.",
                Notification.Type.SUCCESS,
                "settings",
            )
        elif action == "force_logout":
            user.force_logout_after = timezone.now()
            Token.objects.filter(user=user).delete()
            notify_user_admin_action(
                user,
                "Session ended by admin",
                "An admin ended your active session. Please sign in again.",
                Notification.Type.WARNING,
                "settings",
            )
        elif action == "disable_messaging":
            user.messaging_disabled = True
            notify_feature_control(
                user,
                "Chat disabled by admin",
                "An admin turned off chat access for your account. You cannot use chat until an admin turns it back on.",
                Notification.Type.MESSAGE,
                "communication",
                f"admin-chat-disabled-{user.pk}",
            )
        elif action == "enable_messaging":
            user.messaging_disabled = False
            notify_feature_control(
                user,
                "Chat access restored",
                "An admin turned chat access back on for your account.",
                Notification.Type.SUCCESS,
                "communication",
                f"admin-chat-enabled-{user.pk}",
            )
        elif action == "disable_ai":
            user.ai_features_enabled = False
            notify_feature_control(
                user,
                "AI disabled by admin",
                "An admin turned off AI access for your account. You cannot use AI tools until an admin turns it back on.",
                Notification.Type.AI,
                "ai-lab",
                f"admin-ai-disabled-{user.pk}",
            )
        elif action == "enable_ai":
            user.ai_features_enabled = True
            notify_feature_control(
                user,
                "AI access restored",
                "An admin turned AI access back on for your account.",
                Notification.Type.SUCCESS,
                "ai-lab",
                f"admin-ai-enabled-{user.pk}",
            )
        else:
            return Response({"message": "Invalid admin action."}, status=status.HTTP_400_BAD_REQUEST)
        user.save()
        audit(request, f"user_{action}", user.email, user)
        return Response({"user": AdminUserSerializer(user).data})


class AdminResourcesView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        normal_user_filter = Q(is_staff=False, is_superuser=False, role=User.Role.STUDENT)
        users = User.objects.filter(normal_user_filter).annotate(
            course_count=Count("vault_courses", distinct=True),
            resource_count=Count("vault_courses__resources", distinct=True),
            storage_used=Sum("vault_courses__resources__file_size"),
        ).order_by("-date_joined")
        if query:
            users = users.filter(Q(email__icontains=query) | Q(full_name__icontains=query) | Q(university__icontains=query) | Q(major__icontains=query))

        courses = VaultCourse.objects.filter(user__is_staff=False, user__is_superuser=False, user__role=User.Role.STUDENT).select_related("user").annotate(resource_count=Count("resources"), storage_used=Sum("resources__file_size")).order_by("-updated_at")
        resources = VaultResource.objects.filter(course__user__is_staff=False, course__user__is_superuser=False, course__user__role=User.Role.STUDENT).select_related("course", "course__user").order_by("course_id", "category", "-created_at")
        return Response(
            {
                "users": page(users, AdminUserSerializer, request, limit=100),
                "courses": AdminVaultCourseSerializer(courses, many=True).data,
                "resources": AdminVaultResourceSerializer(resources, many=True).data,
            }
        )


class AdminResourceDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        resource = VaultResource.objects.select_related("course", "course__user").get(pk=pk)
        old_removed = resource.is_removed_by_admin
        old_status = resource.moderation_status
        old_public_revoked = resource.public_access_revoked
        for field in ["is_public", "public_access_revoked", "is_removed_by_admin", "moderation_status", "moderation_note"]:
            if field in request.data:
                setattr(resource, field, request.data[field])
        resource.save()
        if old_removed != resource.is_removed_by_admin:
            notify_user_admin_action(
                resource.course.user,
                "Vault resource restored" if not resource.is_removed_by_admin else "Vault resource removed by admin",
                f"An admin {'restored' if not resource.is_removed_by_admin else 'removed'} your Vault resource: {resource.title}.",
                Notification.Type.FILE if not resource.is_removed_by_admin else Notification.Type.WARNING,
                "resources",
            )
        if old_status != resource.moderation_status:
            notify_user_admin_action(
                resource.course.user,
                "Vault resource moderation updated",
                f"An admin marked your Vault resource '{resource.title}' as {resource.moderation_status}.",
                Notification.Type.FILE,
                "resources",
            )
        if old_public_revoked != resource.public_access_revoked:
            notify_user_admin_action(
                resource.course.user,
                "Vault sharing updated",
                f"An admin {'revoked public sharing for' if resource.public_access_revoked else 'restored public sharing for'} your Vault resource: {resource.title}.",
                Notification.Type.FILE,
                "resources",
            )
        audit(request, "resource_updated", resource.title, resource)
        return Response({"resource": AdminVaultResourceSerializer(resource).data})


class AdminAIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.filter(is_staff=False, is_superuser=False, role=User.Role.STUDENT).annotate(
            document_count=Count("ai_documents", distinct=True),
            ai_request_count=Count("ai_usage_logs", distinct=True),
            ai_failed_count=Count("ai_usage_logs", filter=Q(ai_usage_logs__status=AIUsageLog.Status.FAILED), distinct=True),
            ai_blocked_count=Count("ai_usage_logs", filter=Q(ai_usage_logs__status=AIUsageLog.Status.BLOCKED), distinct=True),
            last_ai_activity=Max("ai_usage_logs__created_at"),
        ).order_by("-ai_request_count", "-last_ai_activity", "email")[:100]
        documents = AIStudyDocument.objects.filter(owner__is_staff=False, owner__is_superuser=False, owner__role=User.Role.STUDENT).select_related("owner").order_by("-updated_at")[:200]
        logs = AIUsageLog.objects.filter(user__is_staff=False, user__is_superuser=False, user__role=User.Role.STUDENT).select_related("user").order_by("-created_at")
        return Response(
            {
                "users": [
                    {
                        "id": user.id,
                        "email": user.email,
                        "full_name": user.full_name,
                        "university": user.university,
                        "major": user.major,
                        "ai_features_enabled": user.ai_features_enabled,
                        "document_count": user.document_count or 0,
                        "ai_request_count": user.ai_request_count or 0,
                        "ai_failed_count": user.ai_failed_count or 0,
                        "ai_blocked_count": user.ai_blocked_count or 0,
                        "last_ai_activity": user.last_ai_activity,
                    }
                    for user in users
                ],
                "documents": AdminAIStudyDocumentSerializer(documents, many=True).data,
                "logs": page(logs, AdminAIUsageLogSerializer, request, limit=100),
            }
        )


class AdminAIDocumentDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        document = AIStudyDocument.objects.select_related("owner").get(pk=pk)
        old_allowed = document.ai_processing_allowed
        for field in ["ai_processing_allowed", "provider", "model_name", "last_error"]:
            if field in request.data:
                setattr(document, field, request.data[field])
        document.save()
        if old_allowed != document.ai_processing_allowed:
            notify_user_admin_action(
                document.owner,
                "AI document access restored" if document.ai_processing_allowed else "AI document restricted by admin",
                f"An admin {'restored AI processing for' if document.ai_processing_allowed else 'restricted AI processing for'} your document: {document.title}.",
                Notification.Type.AI if document.ai_processing_allowed else Notification.Type.WARNING,
                "ai-lab",
            )
        audit(request, "ai_document_updated", document.title, document)
        return Response({"document": AdminAIStudyDocumentSerializer(document).data})


class AdminCommunicationView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        conversations = Conversation.objects.annotate(
            participant_count=Count("participants", distinct=True),
            message_count=Count("messages", distinct=True),
            attachment_count=Count("messages", filter=~Q(messages__attachment=""), distinct=True),
            removed_message_count=Count("messages", filter=Q(messages__is_removed_by_admin=True), distinct=True),
        ).order_by("-updated_at")[:80]
        active_messages = Message.objects.exclude(deleted_at__isnull=False)
        student_users = User.objects.filter(is_staff=False, is_superuser=False, role=User.Role.STUDENT).annotate(
            conversation_count=Count("communication_conversations", distinct=True),
            sent_message_count=Count("sent_messages", distinct=True),
            attachment_count=Count("sent_messages", filter=~Q(sent_messages__attachment=""), distinct=True),
            removed_message_count=Count("sent_messages", filter=Q(sent_messages__is_removed_by_admin=True), distinct=True),
            attachment_storage=Sum("sent_messages__attachment_size"),
            last_message_at=Max("sent_messages__created_at"),
        ).order_by("-sent_message_count", "-last_message_at")[:80]
        user_activity = [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "university": user.university,
                "major": user.major,
                "messaging_disabled": user.messaging_disabled,
                "conversation_count": user.conversation_count or 0,
                "sent_message_count": user.sent_message_count or 0,
                "attachment_count": user.attachment_count or 0,
                "removed_message_count": user.removed_message_count or 0,
                "attachment_storage": user.attachment_storage or 0,
                "last_message_at": user.last_message_at,
            }
            for user in student_users
        ]
        return Response(
            {
                "stats": {
                    "friend_requests": FriendRequest.objects.count(),
                    "friendships": Friendship.objects.count(),
                    "conversations": Conversation.objects.count(),
                    "messages": active_messages.count(),
                    "attachments": Message.objects.exclude(attachment="").count(),
                    "blocked_or_removed_messages": Message.objects.filter(is_removed_by_admin=True).count(),
                    "disabled_conversations": Conversation.objects.filter(is_disabled_by_admin=True).count(),
                },
                "conversations": AdminConversationSerializer(conversations, many=True).data,
                "user_activity": user_activity,
            }
        )


class AdminConversationDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        conversation = Conversation.objects.prefetch_related("participants").get(pk=pk)
        old_disabled = conversation.is_disabled_by_admin
        for field in ["is_disabled_by_admin", "moderation_note"]:
            if field in request.data:
                setattr(conversation, field, request.data[field])
        conversation.save()
        if old_disabled != conversation.is_disabled_by_admin:
            notify_users_admin_action(
                conversation.participants.filter(is_active=True),
                "Conversation restored" if not conversation.is_disabled_by_admin else "Conversation disabled by admin",
                f"An admin {'restored' if not conversation.is_disabled_by_admin else 'disabled'} one of your conversations.",
                Notification.Type.MESSAGE if not conversation.is_disabled_by_admin else Notification.Type.WARNING,
                "communication",
                f"admin-conversation-{conversation.pk}",
            )
        audit(request, "conversation_updated", f"Conversation {conversation.pk}", conversation)
        return Response({"conversation": AdminConversationSerializer(conversation).data})


class AdminMessageDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        message = Message.objects.select_related("sender").get(pk=pk)
        old_removed = message.is_removed_by_admin
        for field in ["is_removed_by_admin", "moderation_note"]:
            if field in request.data:
                setattr(message, field, request.data[field])
        message.save()
        if old_removed != message.is_removed_by_admin:
            notify_user_admin_action(
                message.sender,
                "Message restored" if not message.is_removed_by_admin else "Message removed by admin",
                f"An admin {'restored' if not message.is_removed_by_admin else 'removed'} one of your messages.",
                Notification.Type.MESSAGE if not message.is_removed_by_admin else Notification.Type.WARNING,
                "communication",
            )
        audit(request, "message_updated", f"Message {message.pk}", message)
        return Response({"message": AdminMessageSerializer(message).data})


class AdminModerationView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        reports = Report.objects.select_related("reporter", "reported_user", "assigned_to").order_by("-updated_at")
        return Response({"reports": page(reports, AdminReportSerializer, request, limit=50)})


class AdminReportDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        report = Report.objects.select_related("reporter", "reported_user").get(pk=pk)
        old_status = report.status
        serializer = AdminReportSerializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if old_status != report.status and report.reporter:
            notify_user_admin_action(
                report.reporter,
                "Report status updated",
                f"An admin updated your report status to {report.status}.",
                Notification.Type.INFO,
                "communication",
            )
        audit(request, "report_updated", f"Report {report.pk}", report)
        return Response({"report": AdminReportSerializer(report).data})


class AdminTasksRoutineView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        now = timezone.now()
        normal_users = User.objects.filter(is_staff=False, is_superuser=False, role=User.Role.STUDENT).annotate(
            task_count=Count("tasks", distinct=True),
            todo_count=Count("tasks", filter=Q(tasks__status=Task.Status.TODO), distinct=True),
            in_progress_count=Count("tasks", filter=Q(tasks__status=Task.Status.IN_PROGRESS), distinct=True),
            done_count=Count("tasks", filter=Q(tasks__status=Task.Status.DONE), distinct=True),
            high_priority_count=Count("tasks", filter=Q(tasks__priority=Task.Priority.HIGH), distinct=True),
            deadline_count=Count("tasks", filter=Q(tasks__due_at__isnull=False), distinct=True),
            overdue_count=Count("tasks", filter=Q(tasks__due_at__lt=now) & ~Q(tasks__status=Task.Status.DONE), distinct=True),
            routine_slot_count=Count("routine_slots", distinct=True),
            study_session_count=Count("study_sessions", distinct=True),
            study_minutes=Sum("study_sessions__duration_minutes"),
            last_task_update=Max("tasks__updated_at"),
            last_routine_update=Max("routine_slots__updated_at"),
            last_study_session=Max("study_sessions__started_at"),
        ).order_by("-last_task_update", "-last_routine_update", "-last_study_session")[:100]
        user_activity = [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "university": user.university,
                "major": user.major,
                "task_count": user.task_count or 0,
                "todo_count": user.todo_count or 0,
                "in_progress_count": user.in_progress_count or 0,
                "done_count": user.done_count or 0,
                "high_priority_count": user.high_priority_count or 0,
                "deadline_count": user.deadline_count or 0,
                "overdue_count": user.overdue_count or 0,
                "routine_slot_count": user.routine_slot_count or 0,
                "study_session_count": user.study_session_count or 0,
                "study_minutes": user.study_minutes or 0,
                "last_activity": max(
                    [value for value in [user.last_task_update, user.last_routine_update, user.last_study_session] if value],
                    default=None,
                ),
            }
            for user in normal_users
        ]
        return Response(
            {
                "stats": {
                    "tasks_created": Task.objects.count(),
                    "routines_added": RoutineSlot.objects.count(),
                    "deadlines_tracked": Task.objects.exclude(due_at=None).count(),
                    "overdue_tasks": Task.objects.filter(due_at__lt=now).exclude(status=Task.Status.DONE).count(),
                    "study_sessions": StudySession.objects.count(),
                    "study_hours": round((StudySession.objects.aggregate(total=Sum("duration_minutes"))["total"] or 0) / 60, 1),
                },
                "by_status": list(Task.objects.values("status").annotate(value=Count("id")).order_by("status")),
                "by_priority": list(Task.objects.values("priority").annotate(value=Count("id")).order_by("priority")),
                "user_activity": user_activity,
            }
        )


class AdminNotificationsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        templates = NotificationTemplate.objects.order_by("key")
        announcements = SystemAnnouncement.objects.order_by("-created_at")[:80]
        return Response(
            {
                "templates": AdminNotificationTemplateSerializer(templates, many=True).data,
                "announcements": AdminSystemAnnouncementSerializer(announcements, many=True).data,
                "stats": {
                    "unread": Notification.objects.filter(is_read=False).count(),
                    "sent": Notification.objects.count(),
                    "failed": 0,
                },
            }
        )

    def post(self, request):
        semester = parse_positive_int(
            request.data.get("semester"),
            minimum=1,
            maximum=12,
            allow_none=True,
            field_name="semester",
        )
        with transaction.atomic():
            announcement = SystemAnnouncement.objects.create(
                title=str(request.data.get("title", "")).strip(),
                message=str(request.data.get("message", "")).strip(),
                university=str(request.data.get("university", "")).strip(),
                department=str(request.data.get("department", "")).strip(),
                semester=semester,
                sent_by=request.user,
                sent_at=timezone.now(),
            )
            users = User.objects.filter(is_active=True, is_staff=False, is_superuser=False, role=User.Role.STUDENT)
            if announcement.university:
                users = users.filter(university__iexact=announcement.university)
            if announcement.department:
                users = users.filter(major__iexact=announcement.department)
            if announcement.semester:
                users = users.filter(current_semester=announcement.semester)
            recipient_count = users.count()
            Notification.objects.bulk_create(
                [
                    Notification(owner=user, title=announcement.title, message=announcement.message, type=Notification.Type.INFO, source_key=f"announcement:{announcement.pk}:{user.pk}")
                    for user in users
                ],
                ignore_conflicts=True,
            )
            audit(request, "announcement_sent", announcement.title, announcement, {"recipients": recipient_count})
        return Response({"announcement": AdminSystemAnnouncementSerializer(announcement).data, "recipients": recipient_count}, status=status.HTTP_201_CREATED)


class AdminSettingsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        settings = SystemSetting.objects.order_by("key")
        return Response({"settings": AdminSystemSettingSerializer(settings, many=True).data})

    def patch(self, request):
        updated = []
        with transaction.atomic():
            for item in request.data.get("settings", []):
                setting = SystemSetting.objects.filter(key=item.get("key")).first()
                if not setting:
                    continue
                old_value = setting.value
                next_value = normalize_system_setting_value(setting, item.get("value", setting.value))
                if old_value == next_value:
                    continue
                setting.value = next_value
                setting.updated_by = request.user
                setting.save(update_fields=["value", "updated_by", "updated_at"])
                updated.append(setting)
            if updated:
                setting_names = ", ".join(setting.label for setting in updated[:4])
                if len(updated) > 4:
                    setting_names = f"{setting_names}, and {len(updated) - 4} more"
                notify_users_admin_action(
                    User.objects.filter(is_active=True),
                    "Website settings updated",
                    f"An admin updated website settings: {setting_names}.",
                    Notification.Type.INFO,
                    "settings",
                    "admin-global-settings",
                )
            audit(request, "settings_updated", "System settings", metadata={"count": len(updated)})
        return Response({"settings": AdminSystemSettingSerializer(SystemSetting.objects.order_by("key"), many=True).data})


class AdminAuditLogsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        logs = AdminAuditLog.objects.select_related("actor").order_by("-created_at")
        query = (request.query_params.get("q") or "").strip()
        if query:
            logs = logs.annotate(metadata_text=Cast("metadata", TextField()))
            logs = logs.filter(
                Q(actor__email__icontains=query)
                | Q(actor__full_name__icontains=query)
                | Q(action__icontains=query)
                | Q(target_label__icontains=query)
                | Q(metadata_text__icontains=query)
            )
        return Response({"logs": page(logs, AdminAuditLogSerializer, request, limit=80)})
