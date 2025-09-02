from rest_framework import serializers
from .models import Listings
from django.contrib.auth.models import User

class SellerSerializer(serializers.ModelSerializer):
    seller = serializers.PrimaryKeyRelatedField(read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    class Meta:
        model = User
        fields = ['id','title','description','price','image','is_active','created_at','updated_at','seller','seller_username']

class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField()
    class Meta:
        model = Listings
        fields = ['id', 'seller', 'title', 'description', 'price', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']