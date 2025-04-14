from django.contrib import admin
from .models import CampusHub

class CampusHub(admin.ModelAdmin):
    list_display = ('name', 'campus_tag', 'domain', 'created_at')
    search_fields = ('name', 'campus_tag', 'domain')