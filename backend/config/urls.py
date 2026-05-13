from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def health_check(_request):
    """Healthcheck endpoint para load balancers y orquestadores.

    Verifica conectividad de la base de datos. Devuelve 200 si está OK, 503 si no.
    """
    db_ok = True
    db_error = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as exc:  # pragma: no cover - solo se ejecuta en fallo real
        db_ok = False
        db_error = str(exc)

    payload = {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "error",
    }
    if db_error and settings.DEBUG:
        payload["database_error"] = db_error
    return JsonResponse(payload, status=200 if db_ok else 503)


urlpatterns = [
    path('admin/', admin.site.urls),

    # Healthcheck (público, sin auth)
    path('api/v1/health/', health_check, name='health-check'),

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
