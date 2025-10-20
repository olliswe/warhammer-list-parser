from django.urls import path, re_path
from . import views

urlpatterns = [
    # API endpoints
    path('health/', views.health, name='health'),
    path('api/detect-entities/', views.detect_army_entities, name='detect_army_entities'),
    path('api/datasheet/<str:datasheet_id>/', views.get_datasheet, name='get_datasheet'),
    path('api/faction/<str:faction_id>/', views.get_faction, name='get_faction'),
    path('api/detachment/<str:detachment_id>/', views.get_detachment, name='get_detachment'),
    path('api/share/', views.share_list, name='share_list'),
    path('api/shared/<str:slug>/', views.get_shared_list, name='get_shared_list'),

    # React app - catch all remaining routes
    re_path(r'^.*$', views.index, name='index'),
]