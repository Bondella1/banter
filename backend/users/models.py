from django.db import models
from django.contrib.auth.models import AbstractUser, User
from campushub.models import CampusHub
from django.conf import settings 


class CustomUser(AbstractUser):
    is_seller = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profile_image/', blank=True, null=True)#has been implemented yet
    display_name = models.CharField(max_length=150, blank=True, null=True)
    bio = models.TextField(blank=True)

    campus = models.ForeignKey(
        CampusHub,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    def __str__(self):
        return self.username


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings',
        )
    
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    phone= models.CharField( max_length=50, blank=True)
    profile_image = models.ImageField( upload_to='profile_images/', null=True, blank=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    theme=models.CharField(max_length=50,
                           choices=[('light', 'Light'), ('dark', 'Dark')],
                           default = 'light')
    language = models.CharField(max_length=50,
                                default='en')
    timezone = models.CharField(max_length=50,
                                default='UTC')
    privacy_public_profile = models.BooleanField(default=True)
    privacy_show_email = models.BooleanField(default=False)
    created_at = models.DateField(auto_now=False, auto_now_add=True)
    updated_at = models.DateTimeField( auto_now=False, auto_now_add=True)
    
class Meta:
    verbose_name = "User Settings"
    verbose_name_plural = "User Settings"
    
def __str__(self):
    return f"{self.user.username}'s Settings"

# Create your models here.
