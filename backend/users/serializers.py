#converts your Django model (like a User) into JSON for API responses, and vice versa
#validates incoming data when users register or update their profile

from rest_framework import serializers
from .models import CustomUser, UserSettings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
import re


class UserSerializer(serializers.ModelSerializer):
    #for viewing and updating user profile
    profileCompleted = serializers.SerializerMethodField()
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    campus_tag = serializers.CharField(source='campus.campus_tag', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'campus_tag','is_seller', 'profile_image', 'display_name', 'bio', 'profileCompleted']
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'profile_image':{'required':False},
            'bio': {'required': False, 'allow_blank':True }
        }
        
    def get_profileCompleted(self, obj):
        required_fields = ['username', 'email', 'campus', 'profileCompleted']
        return all(getattr(obj, field, None) for field in required_fields)
    
    def validate_email(self,value):
        try:
            validate_email(value)
            if not value.endswith('.edu'):
                raise serializers.ValidationError("Only .edu email addresses allowed")
            return value.lower()
        except ValidationError:
            raise serializers.ValidationError("Invalid email format")

class RegisterSerializer(serializers.ModelSerializer):
    #for registering a new user
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type':'password'}
    )
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'email': {'required':True},
            'username': {
                'validators' : [
                    UniqueValidator(
                        queryset=CustomUser.objects.all(),
                        message="This username is already taken"
                    )
                ]
            }
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password != password2:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match"}
            )
        if len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError("Password must include at least one uppercase letter.")
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError("Password must include at least one lowercase letter.")
        if not re.search(r'\d', password):
            raise serializers.ValidationError("Password must include at least one number.")
        if not re.search(r'[\W_]', password):
            raise serializers.ValidationError("Password must include at least one special character.")
        return attrs
    
    def validate_email(self, value):
        value = value.lower()
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        if not value.endswith('.edu'):
            raise serializers.ValidationError("Only .edu emails allowed")
        return value

    def create(self, validated_data):
        validated_data.pop('password2', None)
        validated_data.pop('is_active', None)
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            **validated_data,
            password=password,
            is_active=False
            #is_seller=validated_data.get('is_seller', False)
            #removed checkbox from registration by commenting out is_seller
        )
        return user
    
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['password'] !=attrs['password2']:
            raise serializers.ValidationError("Passwords dont match")
        return attrs
    
class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields= ['username', 'display_name', 'bio', 'profile_image']
        