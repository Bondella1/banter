from django.urls import path, include
from .views import ListingListView, ListingDetailView, ListingCreateView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
urlpatterns = [
    path('', ListingListView.as_view(), name='listing-list'),
    path('create/', ListingCreateView.as_view(), name='listing-create'),
    path('<int:id>/', ListingDetailView.as_view(), name='listing-detail'),
]