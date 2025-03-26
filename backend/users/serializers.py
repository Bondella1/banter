#converts your Django model (like a User) into JSON for API responses, and vice versa
#validates incoming data when users register or update their profile

from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    #for viewing and updating user profile

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'is_seller', 'profile_image']

class RegisterSerializer(serializers.ModelSerializer):
    #for registering a new user

    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            #is_seller=validated_data.get('is_seller', False)
            #removed checkbox from registration by commenting out is_seller
        )
        return user