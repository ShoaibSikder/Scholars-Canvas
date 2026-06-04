from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email field must be set.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "super_admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        SUPPORT_ADMIN = "support_admin", "Support Admin"
        MODERATOR = "moderator", "Moderator"
        SUPER_ADMIN = "super_admin", "Super Admin"

    class AccountStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        BLOCKED = "blocked", "Blocked"

    username = None

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    university = models.CharField(max_length=255, blank=True)
    major = models.CharField(max_length=255)
    current_semester = models.PositiveSmallIntegerField(default=1)
    avatar = models.ImageField(upload_to="profile_pictures/", blank=True)
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.STUDENT)
    account_status = models.CharField(max_length=24, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)
    institutional_email_verified = models.BooleanField(default=False)
    messaging_disabled = models.BooleanField(default=False)
    ai_features_enabled = models.BooleanField(default=True)
    daily_ai_limit = models.PositiveIntegerField(null=True, blank=True)
    monthly_ai_limit = models.PositiveIntegerField(null=True, blank=True)
    upload_limit_mb = models.PositiveIntegerField(null=True, blank=True)
    force_logout_after = models.DateTimeField(null=True, blank=True)
    suspension_reason = models.TextField(blank=True)
    last_suspicious_activity_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "major"]

    def __str__(self):
        return self.email

    @property
    def is_admin_role(self):
        return self.role in {self.Role.SUPPORT_ADMIN, self.Role.MODERATOR, self.Role.SUPER_ADMIN}


class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    dark_mode = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    study_reminders = models.BooleanField(default=True)
    compact_mode = models.BooleanField(default=False)
    reduce_motion = models.BooleanField(default=False)
    profile_visibility = models.CharField(
        max_length=16,
        choices=[("friends", "Friends only"), ("campus", "Same university"), ("private", "Private")],
        default="friends",
    )
    language = models.CharField(max_length=16, default="en")
    timezone = models.CharField(max_length=64, default="Asia/Dhaka")

    def __str__(self):
        return f"{self.user.email} preferences"
