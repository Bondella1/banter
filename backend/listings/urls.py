from django.urls import path, include
from .views import ListingListView, ListingDetailView, ListingCreateView

app_name = 'listings'

urlpatterns = [
    path('', ListingListView.as_view(), name='listing-list'),
    path('create/', ListingCreateView.as_view(), name='listing-create'),
    path('<int:id>/', ListingDetailView.as_view(), name='listing-detail'),
]