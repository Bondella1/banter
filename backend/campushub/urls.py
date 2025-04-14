from django.urls import path
from . import views

urlpatterns = [
    path('', views.CampusHubListView.as_view(), name='campus-list'),
    path('<str:campus_tag>/', views.CampusHubDetailView.as_view(), name='campus-detail'),
]
