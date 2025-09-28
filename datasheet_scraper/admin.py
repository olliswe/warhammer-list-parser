from django.contrib import admin
from django_json_widget.widgets import JSONEditorWidget
from .models import FactionJson
from django.db.models import JSONField

@admin.register(FactionJson)
class FactionJsonAdmin(admin.ModelAdmin):
    list_display = ['faction_name', 'faction_id']

    formfield_overrides = {
    JSONField: {'widget': JSONEditorWidget},
    }