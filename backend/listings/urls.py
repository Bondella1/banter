from django.urls import path
from .views import ListingListView, ListingDetailView, ListingCreateView

urlpatterns = [
    path('', ListingListView.as_view(), name='listing-list'),
    path('create/', ListingCreateView.as_view(), name='listing-create'),
    path('<int:id>/', ListingDetailView.as_view(), name='listing-detail'),
]