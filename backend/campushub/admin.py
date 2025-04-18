from django.contrib import admin
from .models import CampusHub
from django.urls import path
from django.template.response import TemplateResponse
from users.admin import CustomUserAdmin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

class CampusHubAdmin(admin.ModelAdmin):
    list_display = ('name', 'campus_tag', 'domain', 'created_at')
    search_fields = ('name', 'campus_tag', 'domain')

class CustomAdminSite(admin.AdminSite):
    site_header = 'Bant3r Admin Dashboard'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='admin-dashboard'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        total_campuses = CampusHub.objects.count()
        latest = CampusHub.objects.order_by('-created_at')[:5]

        context = dict(
            self.each_context(request),
            total_campuses=total_campuses,
            latest=latest,
        )
        return TemplateResponse(request, 'admin/dashboard.html', context)
    
CustomUser = get_user_model()
admin_site = CustomAdminSite(name='customdomain')
admin_site.register(CampusHub, CampusHubAdmin)
admin_site.register(CustomUser, CustomUserAdmin)