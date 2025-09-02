#define the logic for what happens when someone hits an API endpoint
from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework.generics import RetrieveAPIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import BasicAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import smart_bytes, smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.html import strip_tags
from django.urls import reverse
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
from .models import CustomUser, UserSettings
from .serializers import RegisterSerializer, UserSerializer, PasswordResetSerializer, PublicUserSerializer, UserSettingsSerializer
import logging
from campushub.models import CampusHub
from cart.models import Cart
 

logger = logging.getLogger(__name__)
User  = get_user_model()

def _build_verify_url(user):
    base = getattr(settings, "FRONTEND_VERIFY_URL_BASE", "http://localhost:3000/verify-email")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{base}/{uid}/{token}/", uid, token

def _send_verification_email(user):
    verify_url, uid, token = _build_verify_url(user)
    subject = "Verify your email address"
    message = f"Click to verify your account: {verify_url}"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
    return verify_url  

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings_api(request, username):
    user = get_object_or_404(CustomUser, username=username)
    if request.user != user:
        return Response({'error':'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    settings, _ = UserSettings.objects.get_or_create(user=user)
    
    if request.method == 'GET':
        return Response({
            'theme': settings.theme,
            'email_notifications': settings.email_notifications,
            'display_name': settings.display_name,
        })
    
    data = request.data
    if 'theme' in data:
        settings.theme  = data['theme']
    if 'email_notifications' in data:
        settings.email_notifications = data['email_notifications']
    if 'display_name' in data:
        settings.display_name = data['display_name']
            
    settings.save()
    return Response({'message': 'Settings updated successfully'})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    campus = getattr(u, "campus", None)
    return Response({
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "has_onboarded": bool(getattr(u, "has_onboarded", False)),
        "campus": {
            "id": campus.id,
            "name": campus.name,
            "domain": campus.domain,
            "tab": getattr(campus, "campus_tag", None),
        } if campus else None,
    })

#POST /api/auth/register/
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '').lower()
        if not email.endswith('.edu'):
            return Response({'error': 'Only .edu email addresses are allowed.'},
                            status=status.HTTP_403_FORBIDDEN)

        domain = email.split('@')[-1]
        username_part = email.split('@')[0]

    # Check if the domain exists in your CampusHub database
        campus = CampusHub.objects.filter(domain__iexact=domain).first()
        if not campus:
            return Response({'error': 'Your school is not yet supported.'},
                        status=status.HTTP_403_FORBIDDEN)

    # Optional: Basic check to avoid generic staff/faculty-like emails
        if any(keyword in username_part for keyword in ['admin', 'helpdesk', 'staff', 'faculty']):
            return Response({'error': 'This appears to be a staff email. Please use a student account.'},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = serializer.save(is_active=False, campus=campus)
            if getattr(user, "campus_id", None) != getattr(campus, "id", None):
                user.campus = campus
                user.save(update_fields=["campus"])
            #create cart at reg
            Cart.objects.get_or_create(user=user)
            #send verfifcation
            verify_url = _send_verification_email(user)
            return Response({
                'message': 'Verification email sent - check your inbox',
                'campus': {
                    "id":campus.id,
                    "name": campus.name,
                    "domain": campus.domain,
                    "tab": campus.campus_tag, #for routing
                },
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#POST login
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        identifier = (request.data.get("username") or request.data.get("email") or "").strip()
        password = request.data.get("password")

        if not identifier or not password:
            return Response(
               {"error": "Both username and password are required"},
              status=status.HTTP_400_BAD_REQUEST
            )
            
        lookup = {"email__iexact": identifier} if "@" in identifier else {"username__iexact": identifier}
        try:
            u = User.objects.get(**lookup)
            username = u.get_username()
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        #check for a deactivated account
        if not user.is_active:
            return Response(
                {"error": "Please verify your email"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        Cart.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)
        
        campus = getattr(user, "campus", None)
        campus_payload = {
            "id": campus.id,
            "name": campus.name,
            "domain": campus.domain,
            "tab": getattr(campus, "campus_tag", None)  # for routing
        } if campus else None
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
            "has_onboarded": bool(getattr(user, "has_onboarded", False)),
            "campus": campus_payload,
        }, status=200)

   
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
class RequestPasswordResetEmail(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if email is None:
            return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'message': 'No user with this email'}, status=status.HTTP_404_NOT_FOUND)

        uidb64 = urlsafe_base64_encode(force_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)

        reset_url = f"http://localhost:5173/reset-password/{uidb64}/{token}/"

        email_body = f"Click the link below to reset your password:\n\n{reset_url}"

        email = EmailMessage(
            subject="Reset your password",
            body=email_body,
            to=[user.email]
        )
        email.send()

        return Response({'message': 'Password reset link sent.'}, status=status.HTTP_200_OK)

class PasswordTokenCheckAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'success': True, 'uidb64': uidb64, 'token': token}, status=status.HTTP_200_OK)

        except (DjangoUnicodeDecodeError, CustomUser.DoesNotExist):
            return Response({'message': 'Token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)

class SetNewPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def patch(self, request):
        serializer = PasswordResetSerializer(data=request.data)  # Create a serializer
        serializer.is_valid(raise_exception=True)
        
        try:
            user_id = smart_str(urlsafe_base64_decode(serializer.validated_data['uidb64']))
            user = CustomUser.objects.get(id=user_id)
            
            if not PasswordResetTokenGenerator().check_token(user, serializer.validated_data['token']):
                return Response(
                    {'error': 'Invalid or expired token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data['password'])
            user.save()
            
            # Invalidate used token
            Token.objects.filter(user=user).delete()
            
            return Response(
                {'message': 'Password reset successful'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': 'Invalid request'},
                status=status.HTTP_400_BAD_REQUEST
            )

class PublicUserView(RetrieveAPIView):
    queryset = CustomUser.objects.filter(is_active=True)
    serializer_class = UserSerializer
    lookup_field = 'username'

#check this later
    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return UserSerializer 
        return PublicUserSerializer 
    
    def get_serializer_context(self):
        context=super().get_serializer_context()
        context['is_public'] = not self.request.user.is_authenticated
        return context
    
    # def get_object(self):
    #     username = self.kwargs.get("username")
    #     print(f"Looking up user: {username}")
    #     return super().get_object()

    
class VerifyEmailView(APIView):
    permission_classes =[permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user =CustomUser.objects.get(pk=uid)

            if not default_token_generator.check_token(user,token):
                return Response({'error': 'Invalid or expired token'},
                                status=status.HTTP_400_BAD_REQUEST)

            Cart.objects.get_or_create(user=user)
            
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])
                
            refresh = RefreshToken.for_user(user)
            
            campus = getattr(user, "campus", None)
            campus_payload = {
                "id": campus.id,
                "name": campus.name,
                "domain": campus.domain,
                "tab": getattr(campus, "campus_tag", None)  # for routing
            } if campus else None
            return Response({'message':'Email successfully verified',
                             'access': str(refresh.access_token),
                             'refresh': str(refresh),
                             'has_onboarded': bool(getattr(user, "has_onboarded", False)),
                             'campus': campus_payload,},
                            status=200)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'error':'InvaliD verification link'}, status=400)
        
class ResendVerificationEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            if user.is_active:
                return Response({'message': 'Account already verified'}, status=200)
            _send_verification_email(user)
            return Response({'message': 'Verification email resent'}, status=200)
        except CustomUser.DoesNotExist:
            return Response({'error': 'No user found with that email'}, status=404)
            
class CompleteOnboardingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.has_onboarded:
            user.has_onboarded = True
            user.save(update_fields=['has_onboarded'])
        return Response({'message': 'Onboarding completed successfully'}, status=200)

class UserSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request):
        # ensure OneToOne exists
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        return settings

    def get(self, request):
        obj = self.get_object(request)
        return Response(UserSettingsSerializer(obj).data)

    def patch(self, request):
        obj = self.get_object(request)
        ser = UserSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)

    
