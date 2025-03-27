from rest_framework import serializers
from .models import Order

class orderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'buyer', 'listing', 'quantity', 'total_price', 'status', 'created_at']
        read_only_fields = ['id', 'buyer', 'total_price', 'status', 'created_at']