from django.urls import path
from. import views
from django.contrib.auth.decorators import login_required
from .views import (
    Main,
    Tramites_All,
    Tramites_Delete_Tramites_All,
    Sitio_Administrativo,
    Cambiar_Gestor,
    Gestores,
    Usuarios_Sd,
    Cambiar_Estado,
    Tramites_Detail_Admin,
    Tramites_Tipo_Pregrado,
    Tramites_Delete_Tramites_Tipo_Pregrado,
    Tramites_Tipo_Posgrado,
    Tramites_Delete_Tramites_Tipo_Posgrado,
    Tramites_Detail_Posgrado,
    Tramites_Detail_Pregrado,
    Tramites_Completados,
    Tramites_Espera,
    Cambiar_Estado_Posgrado,
    Cambiar_Estado_Pregrado,
)
from .views_tramites import (
    Tramites_Anonymous,
    Tramites_Delete_User,
    Tramites_Delete_User_Anonymous,
    Tramites_Detail,
    Tramites_Pregrado_Nacional_Create,
    Tramites_Usuario,
    Tramites_Detail_Usuario,

    Pregrado_Nacional_Legalizacion,
    Tramites_Pregrado_Internacional_Create,
    Pregrado_Internacional_Legalizacion,

    Tramites_Posgrado_Nacional_Create,
    Tramite_Posgrado_Nacional_Create_Legalizacion,
    Tramite_Posgrado_Internacional_Create,
    Tramite_Posgrado_Internacional_Legalizacion, 
)

from .api import TramiteViewSet
from rest_framework import routers

router =  routers.DefaultRouter()
router.register('api/Tramite', TramiteViewSet, 'Tramite')

urlpatterns = [
    # TRAMITES
    path('Secretaria/', Main, name="Secretaria"),
    path('Tramites_Delete_User/<int:id>/', Tramites_Delete_User, name="Tramites_Delete_User"),
    path('Tramites_Detail/<int:pk>/', Tramites_Detail.as_view(), name="Tramites_Detail"),
    path('Tramites_Delete_User_Anonymous/<int:id>/', Tramites_Delete_User_Anonymous, name="Tramites_Delete_User_Anonymous"),
    
    #Usuarios Anonimos
    path('Tramites_Anonymous/', Tramites_Anonymous, name='Tramites_Anonymous'),

    #Usuarios Autenticados
    path('Tramites_Usuario/', Tramites_Usuario, name="Tramites_Usuario"),
     path('Tramites_Detail_Usuario/<int:pk>/', Tramites_Detail_Usuario.as_view(), name="Tramites_Detail_Usuario"),
    
    # PREGRADO NACIONAL 
    path('Tramites_Pregrado_Nacional_Create/',  Tramites_Pregrado_Nacional_Create.as_view(), name="Tramites_Pregrado_Nacional_Create"),
    path('Pregrado_Nacional_Legalizacion/', Pregrado_Nacional_Legalizacion.as_view(), name='Pregrado_Nacional_Legalizacion'),
 
   
    # PREGRADO INTERNACIONAL
    path('Tramites_Pregrado_Internacional_Create/', Tramites_Pregrado_Internacional_Create, name='Tramites_Pregrado_Internacional_Create'),
    path('Pregrado_Internacional_Legalizacion/', Pregrado_Internacional_Legalizacion.as_view(), name='Pregrado_Internacional_Legalizacion'),

    # POSGRADO NACIONAL
    path('Tramites_Posgrado_Nacional_Create/', Tramites_Posgrado_Nacional_Create.as_view(), name="Tramites_Posgrado_Nacional_Create"),
    path('Tramite_Posgrado_Nacional_Create_Legalizacion/', Tramite_Posgrado_Nacional_Create_Legalizacion.as_view(), name="Tramite_Posgrado_Nacional_Create_Legalizacion"),
    
    # POSGRADO INTERNACIONAL  
    path('Tramite_Posgrado_Internacional_Create/', Tramite_Posgrado_Internacional_Create.as_view(), name="Tramite_Posgrado_Internacional_Create"),
    path('Tramite_Posgrado_Internacional_Legalizacion/', Tramite_Posgrado_Internacional_Legalizacion.as_view(), name="Tramite_Posgrado_Internacional_Legalizacion"),

    
     # Admin
    path('Sitio_Administrativo/', login_required(Sitio_Administrativo), name="Sitio_Administrativo"),
    path('Cambiar_Gestor/<int:id>/', login_required(Cambiar_Gestor), name="Cambiar_Gestor"),
    path('Gestores/',login_required(Gestores), name="Gestores"),
    path('Usuarios_Sd/',login_required(Usuarios_Sd), name="Usuarios_Sd"),
    path('Tramites_Completados/',login_required(Tramites_Completados), name="Tramites_Completados"),
    path('Tramites_Espera/',login_required(Tramites_Espera), name="Tramites_Espera"),
    path('Cambiar_Estado/<int:id>/',login_required(Cambiar_Estado), name="Cambiar_Estado"),
    path('Cambiar_Estado_Posgrado/<int:id>/',login_required(Cambiar_Estado_Posgrado), name="Cambiar_Estado_Posgrado"),
    
    path('Cambiar_Estado_Pregrado/<int:id>/',login_required(Cambiar_Estado_Pregrado), name="Cambiar_Estado_Pregrado"),
    
    path('Tramites_All/', Tramites_All.as_view(), name="Tramites_All"),
    path('Tramites_Delete_Tramites_All/<int:id>/', Tramites_Delete_Tramites_All, name="Tramites_Delete_Tramites_All"),
    path('Tramites_Tipo_Pregrado/', Tramites_Tipo_Pregrado, name='Tramites_Tipo_Pregrado'),
    path('Tramites_Delete_Tramites_Tipo_Pregrado/<int:id>/', Tramites_Delete_Tramites_Tipo_Pregrado, name='Tramites_Delete_Tramites_Tipo_Pregrado'),
    path('Tramites_Tipo_Posgrado/', Tramites_Tipo_Posgrado, name='Tramites_Tipo_Posgrado'),
    path('Tramites_Delete_Tramites_Tipo_Posgrado/<int:id>/', Tramites_Delete_Tramites_Tipo_Posgrado, name='Tramites_Delete_Tramites_Tipo_Posgrado'),

    path('Tramites_Detail_Posgrado/<int:pk>/', Tramites_Detail_Posgrado.as_view(), name="Tramites_Detail_Posgrado"),
    path('Tramites_Detail_Pregrado/<int:pk>/', Tramites_Detail_Pregrado.as_view(), name="Tramites_Detail_Pregrado"),

    path('Tramites_Detail_Admin/<int:pk>/', Tramites_Detail_Admin.as_view(), name="Tramites_Detail_Admin"),
    path('Informacion_Usuario/<int:id>/',login_required (views.Informacion_Usuario), name="Informacion_Usuario"),
]

urlpatterns = urlpatterns + router.urls  
