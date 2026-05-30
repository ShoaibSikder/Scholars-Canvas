from django.contrib.auth import authenticate
from django.core.validators import MaxValueValidator, MinValueValidator
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User, UserPreferences


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

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    current_semester = serializers.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "university",
            "major",
            "current_semester",
        ]


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            "dark_mode",
            "email_notifications",
            "push_notifications",
            "study_reminders",
        ]
