from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.contrib.auth.decorators import login_required

# Router para API REST
router = DefaultRouter()
router.register(r'', views.NotificacionViewSet, basename='notificacion')

urlpatterns = [
    # API REST
    path('api/', include(router.urls)),
    
    # Vistas tradicionales (con templates)
    path('', views.Bandeja, name="Bandeja"),
    path('bandeja-admin/', views.BandejaAdmin, name="BandejaAdmin"),
    path('bandeja-admin-gestor/', views.BandejaAdminGestor, name="BandejaAdminGestor"),
    path('borrar/', views.BorrarNotificaciones, name="BorrarNotificaciones"),
    path('visualizar/', views.VisualizarNotificaciones, name="VisualizarNotificaciones"),
]