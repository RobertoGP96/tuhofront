from django.urls import path
from. import views
from django.contrib.auth.decorators import login_required
from .views import (
    MainView,
    Cambiar_Estado,
    Tramites_Detail_Admin,
    Tramites_Tipo_Pregrado,
    Tramites_Delete_Tramites_Tipo_Pregrado,
    Tramites_Tipo_Posgrado,
    Tramites_Delete_Tramites_Tipo_Posgrado,
    Tramites_Detail_Posgrado,
    Tramites_Detail_Pregrado,
    Cambiar_Estado_Posgrado,
    Cambiar_Estado_Pregrado,
    Informacion_Usuario,
    TramiteViewSet,
    EstadisticasView,
    SeguimientoViewSet,
    DocumentoViewSet
)
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'tramites', TramiteViewSet, basename='tramite')
router.register(r'seguimientos', SeguimientoViewSet, basename='seguimiento')
router.register(r'documentos', DocumentoViewSet, basename='documento')


urlpatterns = [
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('cambiar_estado/<int:id>/', login_required(Cambiar_Estado), name="Cambiar_Estado"),
    path('cambiar_estado_posgrado/<int:id>/', login_required(Cambiar_Estado_Posgrado), name="Cambiar_Estado_Posgrado"),
    path('cambiar_estado_pregrado/<int:id>/', login_required(Cambiar_Estado_Pregrado), name="Cambiar_Estado_Pregrado"),
    path('tramites_tipo_pregrado/', Tramites_Tipo_Pregrado, name='Tramites_Tipo_Pregrado'),
    path('tramites_delete_tipo_pregrado/<int:id>/', Tramites_Delete_Tramites_Tipo_Pregrado, name='Tramites_Delete_Tramites_Tipo_Pregrado'),
    path('tramites_tipo_posgrado/', Tramites_Tipo_Posgrado, name='Tramites_Tipo_Posgrado'),
    path('tramites_delete_tipo_posgrado/<int:id>/', Tramites_Delete_Tramites_Tipo_Posgrado, name='Tramites_Delete_Tramites_Tipo_Posgrado'),
    path('tramites_detail_posgrado/<int:pk>/', Tramites_Detail_Posgrado.as_view(), name="Tramites_Detail_Posgrado"),
    path('tramites_detail_pregrado/<int:pk>/', Tramites_Detail_Pregrado.as_view(), name="Tramites_Detail_Pregrado"),
    path('tramites_detail_admin/<int:pk>/', Tramites_Detail_Admin.as_view(), name="Tramites_Detail_Admin"),
    path('informacion_usuario/<int:id>/', login_required(Informacion_Usuario), name="Informacion_Usuario"),
]

urlpatterns = urlpatterns + router.urls  
