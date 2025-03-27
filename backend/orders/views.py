from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Order
from .serializers import orderSerializer
from listings.models import Listings

class OrderCreateView(generics.CreateAPIView):
    #place a new order(must be logged in)
    queryset = Order.objects.all()
    serializer_class = orderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        #get the listing beng ordered
        listing = Listings.objects.get(id=self.request.data['listing'])

        #calculate order price formula = price * quantity
        quantity = int(self.request.data.get('quantity', 1))
        total = listing.price *quantity

        #save  order details
        serializer.save(
            buyer=self.request.user,
            listing=listing,
            quantity=quantity,
            total_price=total,
        )

class UserOrderListView(generics.ListAPIView):
    #view current users orders
    serializer_class = orderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).order_by('-created_at')

