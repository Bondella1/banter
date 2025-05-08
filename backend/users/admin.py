from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id', 'username', 'email', 'campus','is_staff','is_superuser', 'is_active', 'date_joined', 'last_login')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff', 'is_superuser', )
    ordering = ('id',)

    fieldsets = (
        (None, {'fields': ('username', 'email', 'campus','password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups' )}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'campus','email', 'password1', 'password2', 'is_seller', 'is_staff', 'is_superuser')}
        ),
    )

