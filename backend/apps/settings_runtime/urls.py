from django.urls import path

from .views import SystemSettingsView, public_settings


urlpatterns = [
    path('', SystemSettingsView.as_view(), name='system-settings'),
    path('public/', public_settings, name='system-settings-public'),
]
