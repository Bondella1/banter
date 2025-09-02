from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    RequestPasswordResetEmail,
    PasswordTokenCheckAPI,
    SetNewPasswordAPIView,
    PublicUserView, 
    VerifyEmailView,
    ResendVerificationEmailView,
    me,
    CompleteOnboardingView,
    UserSettingsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('request-reset-email/', RequestPasswordResetEmail.as_view(), name='request-reset-email'),
    path('password-reset/<uidb64>/<token>/', PasswordTokenCheckAPI.as_view(), name='password-reset-confirm'),
    path('password-reset-complete/', SetNewPasswordAPIView.as_view(), name='password-reset-complete'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification'),
    path('me/', me, name='me'),
    path('onboarding/complete/', CompleteOnboardingView.as_view(), name='onboarding-complete'),
    path('settings/', UserSettingsView.as_view(), name='settings'),
    path('users/settings/', UserSettingsView.as_view(), name='user-settings'),
]
