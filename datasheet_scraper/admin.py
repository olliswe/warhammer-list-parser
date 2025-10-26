from django.contrib import admin
from django_json_widget.widgets import JSONEditorWidget
from .models import FactionJson, DetachmentJson, DatasheetJson
from django.db.models import JSONField


@admin.register(FactionJson)
class FactionJsonAdmin(admin.ModelAdmin):
    list_display = ["faction_name", "faction_id"]
    readonly_fields = ["created_at", "updated_at"]

    formfield_overrides = {
        JSONField: {"widget": JSONEditorWidget},
    }


@admin.register(DetachmentJson)
class DetachmentJson(admin.ModelAdmin):
    list_display = ["detachment_id", "detachment_name", "faction_id"]
    readonly_fields = ["created_at", "updated_at"]

    formfield_overrides = {
        JSONField: {"widget": JSONEditorWidget},
    }


@admin.register(DatasheetJson)
class DatasheetJson(admin.ModelAdmin):
    list_display = ["datasheet_id", "datasheet_name", "faction_id"]
    readonly_fields = ["created_at", "updated_at"]

    formfield_overrides = {
        JSONField: {"widget": JSONEditorWidget},
    }
