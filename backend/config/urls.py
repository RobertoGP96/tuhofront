
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/v1/', include('api.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Legacy URLs (mantener por compatibilidad durante la transición)
    path('',include('plataforma.urls')),
    path('Usuarios/',include('usuarios.urls')),
    path('AtencionPoblacion/',include('atencion_poblacion.urls')),
    path('Notificaciones/',include('notificaciones.urls')),
    path('SecretariaDocente/', include('secretaria_docente.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)