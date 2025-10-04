"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from plataforma import views
from django.contrib.auth.decorators import login_required
from rest_framework import routers
from .api import NoticiaViewSet
from usuarios.api import UsuarioViewSet
from atencion_poblacion.api import AtencionPoblacionViewSet
from plataforma.views import (
    TramitesDetailAdmin,
    TramitesDetailUsuario,
    TramitesDetailAnonimo,
)


router = routers.DefaultRouter()
router.register('api/Noticias', NoticiaViewSet,'Noticias')
router.register('api/Usuarios', UsuarioViewSet,'Usuarios')
router.register('api/AtencionPoblacion', AtencionPoblacionViewSet,'AtencionPoblacion')



urlpatterns = [
    path('',(views.Inicio), name="Inicio"),
    path('MisTramites/',login_required (views.MisTramites), name="MisTramites"),
    path('SolicitudTramite/',views.SolicitudTramite, name="SolicitudTramite"),
    path('InfoPersonal/',login_required (views.InformacionPersonal), name="InfoPersonal"),
    path('Administracion/',login_required (views.Administracion), name="Administracion"),
    path('TramitesAdmin/',login_required (views.Tramites), name="TramitesAdmin"),
    path('CambiarEstado/<str:tipo_tramite>/<int:id>/',login_required (views.CambiarEstado), name="CambiarEstado"),
    path('EliminarTramite/<str:tipo_tramite>/<int:id>/',login_required (views.EliminarTramite), name="EliminarTramite"),
    path('EliminarTramiteUsuario/<str:tipo_tramite>/<int:id>/',login_required (views.EliminarTramiteUsuario), name="EliminarTramiteUsuario"),
    path('EliminarTramiteUsuarioAnonimo/<str:tipo_tramite>/<int:id>/',views.EliminarTramiteUsuarioAnonimo, name="EliminarTramiteUsuarioAnonimo"),
    path('Usuarios/',login_required (views.Usuarios), name="Usuarios"),
    path('InformacionUsuario/<int:id>/',login_required (views.InformacionUsuario), name="InformacionUsuario"),
    path('EliminarUsuario/<int:id>/',login_required (views.EliminarUsuario), name="EliminarUsuario"),
    path('CambiarRol/<int:id>/',login_required (views.CambiarRol), name="CambiarRol"),
    path('NoticiasUsuario/', views.NoticiasUsuario, name="NoticiasUsuario"),
    path('EditarEmail/',login_required (views.EditarEmail), name="EditarEmail"),
    path('VisualizarNoticiasAdmin/<int:id>/',login_required (views.VisualizarNoticiasAdmin), name="VisualizarNoticiasAdmin"),
    path('VisualizarTramiteUsuario/<int:id>/',login_required (views.VisualizarTramiteUsuario), name="VisualizarTramiteUsuario"),
    path('VisualizarTramiteUsuarioAnonimo/<int:id>/',views.VisualizarTramiteUsuarioAnonimo, name="VisualizarTramiteUsuarioAnonimo"),
    path('VisualizarNoticiasUsuario/<int:id>/', views.VisualizarNoticiasUsuario, name="VisualizarNoticiasUsuario"),
    path('InstalarModulosPDF/',login_required (views.InstalarModulosPDF), name="InstalarModulosPDF"),
    path('Configuracion/',login_required (views.Configuracion), name="Configuracion"),
    path('TramitesDetailAdmin/<int:pk>/',TramitesDetailAdmin.as_view(), name="TramitesDetailAdmin"),
    path('TramitesDetailUsuario/<int:pk>/',TramitesDetailUsuario.as_view(), name="TramitesDetailUsuario"),
    path('TramitesDetailAnonimo/<int:pk>/',TramitesDetailAnonimo.as_view(), name="TramitesDetailAnonimo"),
    
    # Grupos
    path('Grupos/',login_required (views.Grupos), name="Grupos"),
    path('CrearGrupo/', login_required(views.CrearGrupo), name="CrearGrupo"),
    path('EditarGrupo/<int:id>/', login_required(views.EditarGrupo), name="EditarGrupo"),
    path('EliminarGrupo/<int:id>/', login_required(views.EliminarGrupo), name="EliminarGrupo"),
    
    # Noticias
    path('Noticias/',login_required (views.NoticiasView), name="Noticias"),
    path('CrearNoticia/',login_required (views.CrearNoticia), name="CrearNoticia"),
    path('EditarNoticia/<int:id>/',login_required (views.EditarNoticia), name="EditarNoticia"),
    path('EliminarNoticia/<int:id>/',login_required (views.EliminarNoticia), name="EliminarNoticia"),
]


urlpatterns = urlpatterns + router.urls