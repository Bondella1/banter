from rest_framework import serializers
from .models import CampusHub

class CampusHubSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusHub
        fields = '__all__'