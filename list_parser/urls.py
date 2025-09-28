from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('health/', views.health, name='health'),
    path('parse/', views.parse, name='parse'),
    path('api/detect-entities/', views.detect_army_entities, name='detect_army_entities'),
    path('api/datasheet/<str:datasheet_id>/', views.get_datasheet, name='get_datasheet'),
    path('api/faction/<str:faction_id>/', views.get_faction, name='get_faction'),
    path('api/detachment/<str:detachment_id>/', views.get_detachment, name='get_detachment'),
    path('api/share/', views.share_list, name='share_list'),
    path('api/shared/<str:slug>/', views.get_shared_list, name='get_shared_list'),
    path('shared/<str:slug>/', views.shared_list_view, name='shared_list_view'),
]