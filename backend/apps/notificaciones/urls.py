from django.urls import path
from notificaciones import views
from django.contrib.auth.decorators import login_required

urlpatterns = [
    path('',(views.Bandeja), name="Bandeja"),
    path('BandejaAdmin/',(views.BandejaAdmin), name="BandejaAdmin"),
    path('BandejaAdminGestor/',(views.BandejaAdminGestor), name="BandejaAdminGestor"),
    path('BorrarNotificacion/',(views.BorrarNotificaciones), name="BorrarNotificaciones"),
    path('VisualizarNotificacion/',(views.VisualizarNotificaciones), name="VisualizarNotificaciones"),
]