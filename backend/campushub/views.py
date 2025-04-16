from django.shortcuts import render
from rest_framework import generics
from .models import CampusHub
from .serializers import CampusHubSerializer

class CampusHubListView(generics.ListAPIView):
    queryset = CampusHub.objects.all()
    serializer_class = CampusHubSerializer

class CampusHubDetailView(generics.RetrieveAPIView):
    queryset = CampusHub.objects.all()
    serializer_class = CampusHubSerializer
    lookup_field = 'campus_tag'

