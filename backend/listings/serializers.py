from rest_framework import serializers
from .models import Listings

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listings
        fields = ['id', 'seller', 'title', 'description', 'price', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']