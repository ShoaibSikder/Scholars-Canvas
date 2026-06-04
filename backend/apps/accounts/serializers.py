from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import MaxValueValidator, MinValueValidator
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User, UserPreferences
from apps.administration.utils import bool_setting


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    current_semester = serializers.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "password",
            "university",
            "major",
            "current_semester",
        ]
        extra_kwargs = {
            "university": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        if not bool_setting("public_registration_enabled", True):
            raise serializers.ValidationError("Public registration is currently disabled.")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        Token.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False, required=False)

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(
            request=request,
            username=attrs.get("email"),
            password=attrs.get("password"),
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        if user.account_status != User.AccountStatus.ACTIVE:
            raise serializers.ValidationError("User account is not active. Please contact support.")

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    current_semester = serializers.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "university",
            "major",
            "current_semester",
            "avatar",
            "avatar_url",
            "role",
            "is_staff",
            "is_superuser",
            "account_status",
            "institutional_email_verified",
        ]
        read_only_fields = ["id", "avatar_url", "role", "is_staff", "is_superuser", "account_status", "institutional_email_verified"]

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return ""

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value
