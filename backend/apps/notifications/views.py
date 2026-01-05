from django.shortcuts import redirect, render
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from apps.platform.models.user import User
from .models import Notificacion
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import NotificacionSerializer

# Vistas tradicionales (con templates)
@login_required
def Bandeja(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja.html", {'page_obj':page_obj})

def BandejaAdmin(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja Admin.html", {'page_obj':page_obj})


def BandejaAdminGestor(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja Admin Gestores.html", {'page_obj':page_obj})

def BorrarNotificaciones(request:HttpRequest) -> HttpResponse:
    if request.POST:
        lista_elementos = request.POST.getlist('selected-item')
        for e in lista_elementos:
            Notificacion.objects.get(pk=e).delete()
    
    next_url = request.GET.get('next', 'Bandeja')
    return redirect(next_url)

def VisualizarNotificaciones(request:HttpRequest) -> HttpResponse:
    if request.POST:
        lista_elementos = request.POST.getlist('selected-item')
        for e in lista_elementos:
            notificacion = Notificacion.objects.get(pk=e)
            notificacion.visto = True
            notificacion.save()
    
    next_url = request.GET.get('next', 'Bandeja')
    return redirect(next_url)


# API REST ViewSet
class NotificacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar notificaciones mediante REST API.
    
    Endpoints disponibles:
    - GET /api/notifications/ - Lista mis notificaciones
    - GET /api/notifications/{id}/ - Detalle de una notificación
    - POST /api/notifications/{id}/marcar_leida/ - Marca como leída
    - POST /api/notifications/{id}/marcar_no_leida/ - Marca como no leída
    - GET /api/notifications/sin-leer/ - Solo notificaciones sin leer
    - POST /api/notifications/limpiar_expiradas/ - Limpia notificaciones expiradas
    """
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna solo las notificaciones del usuario autenticado"""
        return Notificacion.objects.filter(para=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marca una notificación como leída"""
        notificacion = self.get_object()
        try:
            notificacion.marcar_como_leido(usuario=request.user)
            serializer = self.get_serializer(notificacion)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def marcar_no_leida(self, request, pk=None):
        """Marca una notificación como no leída"""
        notificacion = self.get_object()
        notificacion.marcar_como_no_leido()
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def sin_leer(self, request):
        """Retorna solo las notificaciones sin leer del usuario"""
        notificaciones = self.get_queryset().filter(visto=False)
        serializer = self.get_serializer(notificaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de notificaciones del usuario"""
        queryset = self.get_queryset()
        total = queryset.count()
        sin_leer = queryset.filter(visto=False).count()
        urgentes = queryset.filter(prioridad='CRITICAL').count()
        
        return Response({
            'total': total,
            'sin_leer': sin_leer,
            'urgentes': urgentes,
            'leidas': total - sin_leer,
        })
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marca todas las notificaciones como leídas"""
        notificaciones = self.get_queryset().filter(visto=False)
        count = notificaciones.update(visto=True)
        return Response({
            'mensaje': f'{count} notificaciones marcadas como leídas.'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def limpiar_expiradas(self, request):
        """Limpia las notificaciones expiradas"""
        count = Notificacion.limpiar_expiradas()
        return Response({
            'mensaje': f'{count} notificaciones expiradas eliminadas.'
        }, status=status.HTTP_200_OK)