from django.db import models

class BaseModel(models.Model):
    """
    Abstract base model with common fields
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True



class FactionJson(BaseModel):
    """
    Model to store factions data in JSON format
    """
    data = models.JSONField()
    faction_name = models.CharField(max_length=200)
    faction_id = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"FactionsJson {self.faction_name}"


class DetachmentJson(BaseModel):
    """
    Model to store detachments data in JSON format
    """
    data = models.JSONField()
    detachment_id = models.CharField(max_length=20, unique=True)
    detachment_name = models.CharField(max_length=200)
    faction_id = models.CharField(max_length=20)

    def __str__(self):
        return f"DetachmentJson {self.detachment_name}"


class DatasheetJson(BaseModel):
    """
    Model to store datasheets data in JSON format
    """
    data = models.JSONField()
    datasheet_id = models.CharField(max_length=20, unique=True)
    datasheet_name = models.CharField(max_length=200)
    faction_id = models.CharField(max_length=20)

    def __str__(self):
        return f"DatasheetJson {self.datasheet_name}"