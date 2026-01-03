
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Legacy URLs (mantener por compatibilidad durante la transición)
    path('user/',include('users.urls')),
    path('atention/',include('atention.urls')),
    path('notifications/',include('notifications.urls')),
    path('secretary_doc/', include('secretary_doc.urls')),
    path('platform/',include('plataforma.urls')),
    path('labs/', include('labs.urls')),
    path('internal/', include('internal.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)