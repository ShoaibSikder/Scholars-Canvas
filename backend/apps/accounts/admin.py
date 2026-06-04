from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from rest_framework.authtoken.models import Token

from .models import User, UserPreferences


def force_logout_users(modeladmin, request, queryset):
    queryset.update(force_logout_after=timezone.now())
    Token.objects.filter(user__in=queryset).delete()


force_logout_users.short_description = "Force logout selected users"


def suspend_users(modeladmin, request, queryset):
    queryset.update(account_status=User.AccountStatus.SUSPENDED, is_active=False, force_logout_after=timezone.now())
    Token.objects.filter(user__in=queryset).delete()


suspend_users.short_description = "Suspend selected users"


def reactivate_users(modeladmin, request, queryset):
    queryset.update(account_status=User.AccountStatus.ACTIVE, is_active=True)


reactivate_users.short_description = "Reactivate selected users"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ("email",)
    list_display = (
        "email",
        "full_name",
        "university",
        "major",
        "current_semester",
        "role",
        "account_status",
        "institutional_email_verified",
        "is_staff",
        "date_joined",
    )
    list_filter = (
        "role",
        "account_status",
        "institutional_email_verified",
        "messaging_disabled",
        "ai_features_enabled",
        "is_staff",
        "is_superuser",
        "is_active",
        "university",
        "current_semester",
    )
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile details", {"fields": ("full_name", "university", "major", "current_semester", "avatar")}),
        ("Role and moderation", {"fields": ("role", "account_status", "institutional_email_verified", "suspension_reason", "last_suspicious_activity_at")}),
        ("Feature controls", {"fields": ("messaging_disabled", "ai_features_enabled", "daily_ai_limit", "monthly_ai_limit", "upload_limit_mb", "force_logout_after")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    readonly_fields = ("last_login", "date_joined")
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "university",
                    "major",
                    "current_semester",
                    "password1",
                    "password2",
                    "role",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
    search_fields = ("email", "full_name", "university", "major")
    actions = [force_logout_users, suspend_users, reactivate_users]


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ("user", "dark_mode", "email_notifications", "push_notifications", "profile_visibility", "timezone")
    list_filter = ("dark_mode", "email_notifications", "push_notifications", "profile_visibility", "language", "timezone")
    search_fields = ("user__email", "user__full_name")
