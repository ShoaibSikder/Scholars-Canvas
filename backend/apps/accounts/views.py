import json
import os

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

import requests

from .models import User, UserPreferences
from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegistrationSerializer,
    UserPreferencesSerializer,
    UserSerializer,
)
from apps.administration.models import AdminAuditLog
from apps.administration.utils import bool_setting


def get_resend_setting(key, default=""):
    value = getattr(settings, key, "") or os.environ.get(key, "")
    if value:
        return value

    env_file = settings.BASE_DIR / ".env"
    if not env_file.exists():
        return default

    for raw_line in env_file.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, raw_value = line.split("=", 1)
        if name.strip() == key:
            return raw_value.strip().strip('"').strip("'")
    return default


def send_password_reset_email(user, reset_url):
    resend_api_key = get_resend_setting("RESEND_API_KEY")
    resend_from_email = get_resend_setting("RESEND_FROM_EMAIL", "onboarding@resend.dev")
    if not resend_api_key:
        raise RuntimeError("Resend API key is not configured.")

    payload = {
        "from": resend_from_email,
        "to": [user.email],
        "subject": "Reset your Scholars Canvas password",
        "html": (
            f"<p>Hello {user.full_name or 'Student'},</p>"
            "<p>Use the button below to reset your Scholars Canvas password.</p>"
            f'<p><a href="{reset_url}">Reset password</a></p>'
            "<p>If you did not request this, you can ignore this email.</p>"
        ),
    }
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            data=json.dumps(payload),
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Scholars Canvas/1.0",
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except requests.Timeout as exc:
        raise RuntimeError("Email service timed out. Please try again.") from exc
    except requests.HTTPError as exc:
        error_message = "Unable to send reset email."
        try:
            payload = exc.response.json()
            error_message = payload.get("message") or payload.get("error") or error_message
        except ValueError:
            pass
        raise RuntimeError(error_message) from exc
    except requests.RequestException as exc:
        raise RuntimeError("Email service is unavailable. Please try again later.") from exc


def client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def record_login(user, request, success=True):
    AdminAuditLog.objects.create(
        actor=user,
        action="login_success" if success else "login_failed",
        target_label=user.email if user else request.data.get("email", ""),
        metadata={
            "ip_address": client_ip(request),
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
        },
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if bool_setting("maintenance_mode", False):
            return Response({"message": "Scholars Canvas is currently in maintenance mode."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "university": user.university,
                    "major": user.major,
                    "current_semester": user.current_semester,
                    "role": user.role,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if bool_setting("maintenance_mode", False) and not (user.is_staff or user.is_admin_role):
            return Response({"message": "Scholars Canvas is currently in maintenance mode."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        token, _ = Token.objects.get_or_create(user=user)
        record_login(user, request)
        preferences, _ = UserPreferences.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "university": user.university,
                    "major": user.major,
                    "current_semester": user.current_semester,
                    "role": user.role,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                "preferences": UserPreferencesSerializer(preferences).data,
                "token": token.key,
            }
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if not user:
            return Response({"message": "Do not have any account using this email."}, status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
        try:
            send_password_reset_email(user, reset_url)
        except RuntimeError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({"message": "Password reset link has been sent to your email."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.filter(pk=user_id, is_active=True).first()
        except (TypeError, ValueError, OverflowError):
            user = None

        token = serializer.validated_data["token"]
        if not user or not default_token_generator.check_token(user, token):
            return Response({"message": "Password reset link is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response({"message": "Password reset successfully. Please sign in with your new password."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        preferences_serializer = UserPreferencesSerializer(preferences)
        return Response(
            {
                "user": serializer.data,
                "preferences": preferences_serializer.data,
            }
        )

    def patch(self, request):
        user_payload = {
            key: request.data[key]
            for key in ["full_name", "email", "university", "major", "current_semester", "avatar"]
            if key in request.data
        }
        preferences_payload = {
            key: request.data[key]
            for key in [
                "dark_mode",
                "email_notifications",
                "push_notifications",
                "study_reminders",
                "compact_mode",
                "reduce_motion",
                "profile_visibility",
                "language",
                "timezone",
            ]
            if key in request.data
        }

        user_serializer = UserSerializer(request.user, data=user_payload, partial=True, context={"request": request})
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        if preferences_payload:
            preferences_serializer = UserPreferencesSerializer(preferences, data=preferences_payload, partial=True)
            preferences_serializer.is_valid(raise_exception=True)
            preferences_serializer.save()

        return Response(
            {
                "message": "Profile updated successfully.",
                "user": UserSerializer(request.user, context={"request": request}).data,
                "preferences": UserPreferencesSerializer(preferences).data,
            }
        )


class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = User.objects.filter(pk=pk, is_active=True).first()
        if not user:
            return Response({"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, context={"request": request})
        return Response({"user": serializer.data})
