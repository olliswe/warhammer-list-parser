from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('detect-entities/', views.detect_army_entities, name='detect_army_entities'),
    path('datasheet/<str:datasheet_id>/', views.get_datasheet, name='get_datasheet'),
    path('faction/<str:faction_id>/', views.get_faction, name='get_faction'),
    path('detachment/<str:detachment_id>/', views.get_detachment, name='get_detachment'),
]