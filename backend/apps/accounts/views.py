from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserPreferences
from .serializers import LoginSerializer, RegistrationSerializer, UserPreferencesSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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
        token, _ = Token.objects.get_or_create(user=user)

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
                },
                "token": token.key,
            }
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
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
            for key in ["full_name", "email", "university", "major", "current_semester"]
            if key in request.data
        }
        preferences_payload = {
            key: request.data[key]
            for key in ["dark_mode", "email_notifications", "push_notifications", "study_reminders"]
            if key in request.data
        }

        user_serializer = UserSerializer(request.user, data=user_payload, partial=True)
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
                "user": UserSerializer(request.user).data,
                "preferences": UserPreferencesSerializer(preferences).data,
            }
        )
