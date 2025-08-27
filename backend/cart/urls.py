from django.urls import path
from .views import CartViewSet

cart_list = CartViewSet.as_view({"get": "list"})
add_item = CartViewSet.as_view({"post": "add_item"})
update_item = CartViewSet.as_view({"patch": "update_item", "delete": "remove_item"})
clear_cart = CartViewSet.as_view({"post": "clear"})

urlpatterns = [
    path("cart/", cart_list, name="cart-detail"),
    path("cart/items/", add_item, name="cart-add-item"),
    path("cart/items/<int:pk>/", update_item, name="cart-item"),
    path("cart/clear/", clear_cart, name="cart-clear"),
]
