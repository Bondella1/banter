from django.shortcuts import render
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cart, CartItem, Product
from .serializers import CartSerializer, CartItemSerializer

def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    # GET /api/cart/
    def list(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

    # POST /api/cart/items/  { "product_id": 1, "quantity": 2 }
    @action(detail=False, methods=["post"], url_path="items")
    def add_item(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        qty = serializer.validated_data.get("quantity", 1)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += qty
        else:
            item.quantity = max(1, qty)
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    # PATCH /api/cart/items/<item_id>/  { "quantity": 3 }
    @action(detail=True, methods=["patch"], url_path="items")
    def update_item(self, request, pk=None):
        cart = get_or_create_cart(request.user)
        try:
            item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)

        qty = int(request.data.get("quantity", item.quantity))
        item.quantity = max(1, qty)
        item.save()
        return Response(CartSerializer(cart).data)

    # DELETE /api/cart/items/<item_id>/
    @action(detail=True, methods=["delete"], url_path="items")
    def remove_item(self, request, pk=None):
        cart = get_or_create_cart(request.user)
        deleted, _ = cart.items.filter(pk=pk).delete()
        if not deleted:
            return Response({"detail": "Not found."}, status=404)
        return Response(CartSerializer(cart).data)

    # POST /api/cart/clear/
    @action(detail=False, methods=["post"])
    def clear(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)

