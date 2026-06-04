from django.urls import path

from .views import LoginView, MeView, PasswordResetConfirmView, PasswordResetRequestView, PublicProfileView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", MeView.as_view(), name="me"),
    path("users/<int:pk>/profile/", PublicProfileView.as_view(), name="public-profile"),
]
