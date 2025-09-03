from django.db.models import Q
from rest_framework import generics, permissions, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Listings
from .serializers import ListingSerializer
from .permisions import IsOwnerOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class ListingListView(generics.ListAPIView):
    #view all active listings
    queryset = Listings.objects.all().select_related('seller')
    serializer_class = ListingSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Listings.objects.filter(is_active=True).select_related('seller').order_by('-created_at')
        seller = self.request.query_params.get('seller')
        if seller:
            if seller.isdigit():
                return qs.filter(seller__id=seller)
            return qs.filter(Q(seller__username=seller))
        return qs

class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    #view a single listing
    queryset = Listings.objects.select_related('seller').all()
    serializer_class = ListingSerializer
    authentication_classes = [JWTAuthentication]
    permissions_classeses = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = 'id'

class ListingCreateView(generics.CreateAPIView):
    #create a listing
    queryset = Listings.objects.all()
    serializer_class = ListingSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(seller=self.request.user, is_active=True)
        print("CREATED LISTING:", instance.id, instance.is_active, instance.seller_id)  # keep temporarily
