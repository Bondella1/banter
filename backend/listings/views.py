from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Listings
from .serializers import ListingSerializer

class ListingListView(generics.ListAPIView):
    #view all active listings
    queryset = Listings.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ListingSerializer

class ListingDetailView(generics.RetrieveAPIView):
    #view a single listing
    queryset = Listings.objects.all()
    serializer_class = ListingSerializer
    lookup_field = 'id'

class ListingCreateView(generics.CreateAPIView):
    #create a listing
    queryset = Listings.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)