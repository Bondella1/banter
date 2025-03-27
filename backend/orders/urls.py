from django.urls import path
from .views import OrderCreateView, UserOrderListView

urlpatterns = [
    #create a new order
    path('', OrderCreateView.as_view(), name='order-create'),
    #view users order
    path('my/', UserOrderListView.as_view(), name='order-list'),
]