from django.contrib import admin
from django.utils.html import format_html
from .models import SharedList


@admin.register(SharedList)
class SharedListAdmin(admin.ModelAdmin):
    """
    Admin interface for SharedList model
    """
    list_display = ('name', 'slug_link', 'view_count', 'created_at', 'list_preview')
    list_filter = ('created_at', 'view_count')
    search_fields = ('name', 'slug', 'raw_text')
    readonly_fields = ('slug', 'created_at', 'view_count', 'formatted_parsed_data')
    ordering = ('-created_at',)
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'created_at', 'view_count')
        }),
        ('List Content', {
            'fields': ('raw_text',)
        }),
        ('Parsed Data', {
            'fields': ('formatted_parsed_data',),
            'classes': ('collapse',)
        }),
    )

    def slug_link(self, obj):
        """Display slug as a clickable link to the shared list"""
        url = f"/api/shared/{obj.slug}/"
        return format_html('<a href="{}" target="_blank">{}</a>', url, obj.slug)
    slug_link.short_description = 'Slug (Link)'

    def list_preview(self, obj):
        """Display a preview of the raw text"""
        preview = obj.raw_text[:100]
        if len(obj.raw_text) > 100:
            preview += '...'
        return preview
    list_preview.short_description = 'Preview'

    def formatted_parsed_data(self, obj):
        """Display formatted parsed data as JSON"""
        import json
        try:
            formatted_json = json.dumps(obj.parsed_data, indent=2)
            return format_html('<pre style="max-height: 400px; overflow: auto;">{}</pre>', formatted_json)
        except (TypeError, ValueError):
            return str(obj.parsed_data)
    formatted_parsed_data.short_description = 'Parsed Data (JSON)'

    actions = ['reset_view_count', 'delete_selected']

    def reset_view_count(self, request, queryset):
        """Reset view count to 0 for selected lists"""
        count = queryset.update(view_count=0)
        self.message_user(request, f'Successfully reset view count for {count} list(s).')
    reset_view_count.short_description = 'Reset view count to 0'
