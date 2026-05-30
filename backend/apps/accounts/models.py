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

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    university = models.CharField(max_length=255, blank=True)
    major = models.CharField(max_length=255)
    current_semester = models.PositiveSmallIntegerField(default=1)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "major"]

    def __str__(self):
        return self.email


class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    dark_mode = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    study_reminders = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.email} preferences"
