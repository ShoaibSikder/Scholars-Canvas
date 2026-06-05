from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone

from apps.accounts.models import User
from apps.ai_lab.models import AIStudyDocument
from apps.communication.models import Conversation, Message
from apps.resources.models import VaultResource
from apps.tasks.models import StudySession, Task
from apps.notification.models import Notification

from .models import (
    AIUsageLog,
    AdminAuditLog,
    NotificationTemplate,
    Report,
    SystemAnnouncement,
    SystemSetting,
)


def admin_dashboard_view(request):
    today = timezone.now().date()
    context = {
        **admin.site.each_context(request),
        "title": "Scholars Canvas Admin Dashboard",
        "cards": [
            ("Total users", User.objects.count()),
            ("Active users", User.objects.filter(is_active=True, account_status=User.AccountStatus.ACTIVE).count()),
            ("New registrations today", User.objects.filter(date_joined__date=today).count()),
            ("Uploaded resources", VaultResource.objects.count()),
            ("Storage used (MB)", round((VaultResource.objects.aggregate(total=Sum("file_size"))["total"] or 0) / 1024 / 1024, 2)),
            ("AI requests", AIUsageLog.objects.count()),
            ("AI failures", AIUsageLog.objects.filter(status=AIUsageLog.Status.FAILED).count()),
            ("Open reports", Report.objects.filter(status=Report.Status.OPEN).count()),
            ("Tasks created", Task.objects.count()),
            ("Study sessions", StudySession.objects.count()),
            ("Conversations", Conversation.objects.count()),
            ("Chat files", Message.objects.exclude(attachment="").count()),
        ],
        "file_types": VaultResource.objects.values("resource_type").annotate(total=Count("id")).order_by("-total"),
        "feature_usage": [
            ("Vault", VaultResource.objects.count()),
            ("AI Lab", AIStudyDocument.objects.count() + AIUsageLog.objects.count()),
            ("Tasks", Task.objects.count()),
            ("Routine/Study", StudySession.objects.count()),
            ("Communication", Message.objects.count()),
        ],
        "recent_errors": AIUsageLog.objects.filter(status=AIUsageLog.Status.FAILED)[:10],
    }
    return TemplateResponse(request, "admin/administration/dashboard.html", context)


original_get_urls = admin.site.get_urls


def get_admin_urls():
    urls = original_get_urls()
    custom_urls = [
        path("scholars-canvas-dashboard/", staff_member_required(admin_dashboard_view), name="scholars-canvas-dashboard"),
    ]
    return custom_urls + urls


admin.site.get_urls = get_admin_urls
admin.site.site_header = "Scholars Canvas Admin"
admin.site.site_title = "Scholars Canvas Admin"
admin.site.index_title = "Admin Control Center"


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "setting_type", "is_secret", "updated_by", "updated_at")
    list_filter = ("setting_type", "is_secret", "updated_at")
    search_fields = ("key", "label", "description")
    readonly_fields = ("updated_at",)

    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("id", "reason", "status", "reporter", "reported_user", "assigned_to", "updated_at")
    list_filter = ("reason", "status", "created_at", "updated_at")
    search_fields = ("reporter__email", "reported_user__email", "details", "resolution_note")
    autocomplete_fields = ("reporter", "reported_user", "assigned_to")
    actions = ["assign_to_me", "mark_reviewing", "mark_resolved", "mark_dismissed"]

    @admin.action(description="Assign selected reports to me")
    def assign_to_me(self, request, queryset):
        queryset.update(assigned_to=request.user)

    @admin.action(description="Mark selected reports reviewing")
    def mark_reviewing(self, request, queryset):
        queryset.update(status=Report.Status.REVIEWING)

    @admin.action(description="Mark selected reports resolved")
    def mark_resolved(self, request, queryset):
        queryset.update(status=Report.Status.RESOLVED)

    @admin.action(description="Mark selected reports dismissed")
    def mark_dismissed(self, request, queryset):
        queryset.update(status=Report.Status.DISMISSED)


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("user", "feature", "provider", "model_name", "status", "unsafe_prompt", "created_at")
    list_filter = ("feature", "provider", "model_name", "status", "unsafe_prompt", "created_at")
    search_fields = ("user__email", "user__full_name", "feature", "error_message")
    readonly_fields = ("created_at",)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("key", "title", "type", "page", "is_active", "updated_at")
    list_filter = ("type", "page", "is_active")
    search_fields = ("key", "title", "message")


@admin.register(SystemAnnouncement)
class SystemAnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "university", "department", "semester", "sent_by", "sent_at", "created_at")
    list_filter = ("university", "department", "semester", "sent_at", "created_at")
    search_fields = ("title", "message", "university", "department")
    actions = ["send_announcements"]

    @admin.action(description="Send selected announcements")
    def send_announcements(self, request, queryset):
        for announcement in queryset:
            users = self._target_users(announcement)
            notifications = [
                Notification(
                    owner=user,
                    title=announcement.title,
                    message=announcement.message,
                    type=Notification.Type.INFO,
                    source_key=f"announcement:{announcement.pk}:{user.pk}",
                )
                for user in users
            ]
            Notification.objects.bulk_create(notifications, ignore_conflicts=True)
            announcement.sent_by = request.user
            announcement.sent_at = timezone.now()
            announcement.save(update_fields=["sent_by", "sent_at"])

    def _target_users(self, announcement):
        from apps.accounts.models import User

        users = User.objects.filter(is_active=True)
        if announcement.university:
            users = users.filter(university__iexact=announcement.university)
        if announcement.department:
            users = users.filter(major__iexact=announcement.department)
        if announcement.semester:
            users = users.filter(current_semester=announcement.semester)
        return users


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "target_label", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("actor__email", "action", "target_label")
    readonly_fields = ("actor", "action", "target_label", "content_type", "object_id", "metadata", "created_at")
