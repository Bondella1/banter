from rest_framework import serializers
from .models import Listings
from django.contrib.auth.models import User

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'profile_image']

class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField()
    class Meta:
        model = Listings
        fields = ['id', 'seller', 'title', 'description', 'price', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']