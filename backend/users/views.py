#define the logic for what happens when someone hits an API endpoint
from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework.generics import RetrieveAPIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import smart_bytes, smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.html import strip_tags
from django.urls import reverse
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
from .models import CustomUser
from .serializers import RegisterSerializer, UserSerializer, PasswordResetSerializer, PublicUserSerializer
import logging
from campushub.models import CampusHub

logger=logging.getLogger(__name__)
User  = get_user_model()

#POST /api/auth/register/
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

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
            self._sendverificationemail(user, request)
            return Response({
                'message': 'Verification email sent - check your inbox',
                'campus': campus.name if campus else None
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#POST login
class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Both username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        #check for a deactivated account
        if not user.is_active:
            return Response(
                {"error": "Account is inactive"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        token, _=Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        })

 #GET or PUT    
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
    
    def get_object(self):
        username = self.kwargs.get("username")
        print(f"Looking up user: {username}")
        return super().get_object()

    
class VerifyEmailView(APIView):
    permission_classes =[permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user =CustomUser.objects.get(pk=uid)

            if not default_token_generator.check_token(user,token):
                return Response({'error': 'Invalid or expired token'},
                                status=status.HTTP_400_BAD_REQUEST)
            if user.is_active:
                return Response({'message': 'Account already activated'},
                                status=status.HTTP_200_OK)
            user.is_active=True
            user.save()
            token, _= Token.objects.get_or_create(user=user)
            return Response({'message':'Email successfully verified',
                             'token': token.key},
                            status=status.HTTP_200_OK)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'error':'InvaliD verification link'},
                            status=status.HTTP_400_BAD_REQUEST)
        
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

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verification_url = f"http://localhost:3000/verify-email/{uid}/{token}/"

            send_mail(
                subject='Verify your email address (Resent)',
                message=f"Click to verify: {verification_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )

            return Response({'message': 'Verification email resent'}, status=200)

        except CustomUser.DoesNotExist:
            return Response({'error': 'No user found with that email'}, status=404)
    