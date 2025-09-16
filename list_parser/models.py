from django.db import models
import string
import random
from django.utils import timezone

class SharedList(models.Model):
    """
    Model for storing shared army lists with unique slugs
    """
    slug = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    raw_text = models.TextField()
    parsed_data = models.JSONField()
    created_at = models.DateTimeField(default=timezone.now)
    view_count = models.PositiveIntegerField(default=0)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique random slug"""
        while True:
            # Generate random slug (8 characters: letters and numbers)
            slug = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            if not SharedList.objects.filter(slug=slug).exists():
                return slug
    
    def increment_view_count(self):
        """Increment the view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def __str__(self):
        return f"{self.name} ({self.slug})"
    
    class Meta:
        ordering = ['-created_at']
