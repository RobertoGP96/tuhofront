from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 Endpoints
    path('api/v1/', include([
        path('auth/', include('apps.platform.urls.auth')),
        path('', include('apps.platform.urls')),
        path('notificaciones/', include('apps.notifications.urls')),
        path('tramites-secretaria/', include('apps.secretary_doc.urls')),
        path('labs/', include('apps.labs.urls')),
        path('internal/', include('apps.internal.urls')),
        path('audit/', include('apps.audit.urls')),
        path('documents/', include('apps.documents.urls')),
        path('public/', include('apps.platform.urls.public')),
        path('settings/', include('apps.settings_runtime.urls')),
    ])),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
