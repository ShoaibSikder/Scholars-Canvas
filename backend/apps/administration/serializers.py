from rest_framework import serializers

from apps.accounts.models import User
from apps.ai_lab.models import AIStudyDocument
from apps.communication.models import Conversation, Message
from apps.resources.models import VaultCourse, VaultResource

from .models import AIUsageLog, AdminAuditLog, NotificationTemplate, Report, SystemAnnouncement, SystemSetting


class AdminUserSerializer(serializers.ModelSerializer):
    joined_date = serializers.DateTimeField(source="date_joined", read_only=True)
    course_count = serializers.IntegerField(read_only=True)
    task_count = serializers.IntegerField(read_only=True)
    resource_count = serializers.IntegerField(read_only=True)
    storage_used = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "university",
            "major",
            "current_semester",
            "role",
            "account_status",
            "institutional_email_verified",
            "messaging_disabled",
            "ai_features_enabled",
            "daily_ai_limit",
            "monthly_ai_limit",
            "upload_limit_mb",
            "is_active",
            "is_staff",
            "last_login",
            "joined_date",
            "course_count",
            "task_count",
            "resource_count",
            "storage_used",
        ]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "full_name",
            "university",
            "major",
            "current_semester",
            "role",
            "account_status",
            "institutional_email_verified",
            "messaging_disabled",
            "ai_features_enabled",
            "daily_ai_limit",
            "monthly_ai_limit",
            "upload_limit_mb",
            "is_active",
            "is_staff",
            "suspension_reason",
        ]


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "password",
            "university",
            "major",
            "current_semester",
            "role",
            "is_active",
        ]
        extra_kwargs = {
            "university": {"required": False, "allow_blank": True},
            "role": {"required": False},
            "is_active": {"required": False},
        }

    def validate_role(self, value):
        return User.Role.STUDENT if value == User.Role.STUDENT else User.Role.SUPER_ADMIN

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.pop("role", User.Role.STUDENT)
        user = User.objects.create_user(password=password, role=role, **validated_data)
        user.is_staff = user.is_admin_role
        user.save(update_fields=["is_staff"])
        return user


class AdminVaultCourseSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    owner_email = serializers.EmailField(source="user.email", read_only=True)
    owner_name = serializers.CharField(source="user.full_name", read_only=True)
    university = serializers.CharField(source="user.university", read_only=True)
    resource_count = serializers.IntegerField(read_only=True)
    storage_used = serializers.IntegerField(read_only=True)

    class Meta:
        model = VaultCourse
        fields = ["id", "user_id", "code", "title", "semester", "owner_email", "owner_name", "university", "resource_count", "storage_used", "created_at", "updated_at"]


class AdminVaultResourceSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source="course.id", read_only=True)
    owner_id = serializers.IntegerField(source="course.user.id", read_only=True)
    course_code = serializers.CharField(source="course.code", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    owner_email = serializers.EmailField(source="course.user.email", read_only=True)
    owner_name = serializers.CharField(source="course.user.full_name", read_only=True)

    class Meta:
        model = VaultResource
        fields = [
            "id",
            "course_id",
            "owner_id",
            "title",
            "category",
            "resource_type",
            "file_size",
            "content_type",
            "is_public",
            "public_access_revoked",
            "is_removed_by_admin",
            "moderation_status",
            "moderation_note",
            "course_code",
            "course_title",
            "owner_email",
            "owner_name",
            "created_at",
            "updated_at",
        ]


class AdminAIStudyDocumentSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)

    class Meta:
        model = AIStudyDocument
        fields = ["id", "title", "course", "owner_id", "owner_email", "owner_name", "ai_processing_allowed", "request_count", "provider", "model_name", "last_error", "created_at", "updated_at"]


class AdminAIUsageLogSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = AIUsageLog
        fields = ["id", "user_id", "user_email", "feature", "provider", "model_name", "status", "unsafe_prompt", "error_message", "created_at"]


class AdminConversationSerializer(serializers.ModelSerializer):
    participant_count = serializers.IntegerField(read_only=True)
    message_count = serializers.IntegerField(read_only=True)
    attachment_count = serializers.IntegerField(read_only=True)
    removed_message_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "is_group", "is_disabled_by_admin", "moderation_note", "participant_count", "message_count", "attachment_count", "removed_message_count", "created_at", "updated_at"]


class AdminMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation_id", "is_removed_by_admin", "moderation_note", "created_at", "deleted_at"]


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.EmailField(source="reporter.email", read_only=True, allow_null=True)
    reported_user_email = serializers.EmailField(source="reported_user.email", read_only=True, allow_null=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True, allow_null=True)

    class Meta:
        model = Report
        fields = ["id", "reason", "details", "status", "reporter_email", "reported_user_email", "assigned_to", "assigned_to_email", "resolution_note", "created_at", "updated_at"]


class AdminNotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = ["id", "key", "title", "message", "type", "page", "is_active", "updated_at"]


class AdminSystemAnnouncementSerializer(serializers.ModelSerializer):
    sent_by_email = serializers.EmailField(source="sent_by.email", read_only=True, allow_null=True)

    class Meta:
        model = SystemAnnouncement
        fields = ["id", "title", "message", "university", "department", "semester", "sent_by_email", "sent_at", "created_at"]


class AdminSystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ["id", "key", "label", "setting_type", "value", "is_secret", "description", "updated_at"]


class AdminAuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True, allow_null=True)
    actor_role = serializers.CharField(source="actor.role", read_only=True, allow_null=True)

    class Meta:
        model = AdminAuditLog
        fields = ["id", "actor_email", "actor_role", "action", "target_label", "metadata", "created_at"]


class AdminTaskStatsSerializer(serializers.Serializer):
    tasks_created = serializers.IntegerField()
    routines_added = serializers.IntegerField()
    deadlines_tracked = serializers.IntegerField()
    study_sessions = serializers.IntegerField()
