from django.contrib import admin
from .models import CampusHub
from django.urls import path, reverse
from django.template.response import TemplateResponse
from users.admin import CustomUserAdmin
from django.contrib.auth import get_user_model
from django.db.models import Count
from users.admin import CustomUserAdmin
from django.utils.html import format_html

class CampusHubAdmin(admin.ModelAdmin):
    list_display = ('name', 'campus_tag', 'domain', "user_count_link",'created_at')
    search_fields = ('name', 'campus_tag', 'domain')
    
    def _user_fk_and_accessor(self):
        """
        Returns (user_fk_name_on_user, reverse_accessor_on_hub) if a FK from
        User -> CampusHub exists; otherwise (None, None).
        """
        User = get_user_model()
        for f in User._meta.get_fields():
            if getattr(f, "many_to_one", False) and getattr(f, "related_model", None) is CampusHub:
                # e.g., field name on User: 'campus_hub'
                # reverse accessor on CampusHub: 'user_set' or related_name
                return f.name, f.remote_field.get_accessor_name()
        return None, None

    # Annotate with counts when possible (FK path)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        _fk, accessor = self._user_fk_and_accessor()
        if accessor:
            qs = qs.annotate(_user_count=Count(accessor, distinct=True))
        return qs

    # Clickable count -> filters Users by this hub
    def user_count_link(self, obj):
        User = get_user_model()
        changelist = reverse(f"admin:{User._meta.app_label}_{User._meta.model_name}_changelist")
        fk_name, _accessor = self._user_fk_and_accessor()

        if fk_name:
            count = getattr(obj, "_user_count", 0)
            return format_html(
                '<a href="{}?{}__id__exact={}">{}</a>',
                changelist, fk_name, obj.id, count
            )

        # Fallback: count by email domain (e.g., *@gsu.edu)
        domain = (obj.domain or "").strip()
        total = User.objects.filter(email__iendswith=("@" + domain) if domain else "").count()
        return format_html('<a href="{}?q={}">{}</a>', changelist, domain, total)

    user_count_link.short_description = "Users"
    user_count_link.admin_order_field = "_user_count"

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
            latest=latest
        )
        return TemplateResponse(request, 'admin/dashboard.html', context)
    
CustomUser = get_user_model()
admin_site = CustomAdminSite(name='customdomain')
admin_site.register(CampusHub, CampusHubAdmin)
admin_site.register(CustomUser, CustomUserAdmin)