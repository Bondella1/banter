from django.db import models
from django.contrib.auth.models import AbstractUser
from campushub.models import CampusHub

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

# Create your models here.
