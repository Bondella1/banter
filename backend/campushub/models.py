from django.db import models

class CampusHub (models.Model):
    name =models.CharField(max_length=100)
    campus_tag = models.CharField(max_length=50, unique=True)
    domain = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name