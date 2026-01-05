from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _

from ..models.procedure import Procedure
from ..serializers.procedure import (
    ProcedureSerializer,
    ProcedureDetailSerializer,
    ProcedureListSerializer
)


class ProcedureViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Procedures (trámites).
    
    Proporciona operaciones CRUD y acciones adicionales para trámites.
    """
    
    queryset = Procedure.objects.all().select_subclasses()
    serializer_class = ProcedureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['state', 'user', 'created_at', 'deadline']
    ordering_fields = ['created_at', 'deadline', 'state']
    ordering = ['-created_at']
    search_fields = ['numero_seguimiento', 'user__username', 'user__email', 'observation']
    
    def get_serializer_class(self):
        """Retorna diferente serializer según la acción"""
        if self.action == 'retrieve':
            return ProcedureDetailSerializer
        elif self.action == 'list':
            return ProcedureListSerializer
        return self.serializer_class
    
    def get_queryset(self):
        """Filtra trámites según permisos del usuario"""
        user = self.request.user
        
        # Superusarios ven todos los trámites
        if user.is_staff:
            return Procedure.objects.all().select_subclasses()
        
        # Usuarios normales solo ven sus propios trámites
        return Procedure.objects.filter(user=user).select_subclasses()
    
    def perform_create(self, serializer):
        """Crea un nuevo trámite asignándolo al usuario actual"""
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """Actualiza un trámite solo si está en estado BORRADOR"""
        instance = self.get_object()
        if not instance.can_edit():
            return Response(
                {'error': _('Solo se pueden editar trámites en estado BORRADOR')},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Acción para enviar un trámite"""
        procedure = self.get_object()
        
        try:
            procedure.submit()
            serializer = self.get_serializer(procedure)
            return Response(
                {'message': _('Trámite enviado exitosamente'), 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Acción para aprobar un trámite (solo admin)"""
        if not request.user.is_staff:
            return Response(
                {'error': _('Solo administradores pueden aprobar trámites')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        procedure = self.get_object()
        
        try:
            procedure.approve()
            serializer = self.get_serializer(procedure)
            return Response(
                {'message': _('Trámite aprobado exitosamente'), 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def my_procedures(self, request):
        """Obtiene todos los trámites del usuario actual"""
        procedures = self.get_queryset().filter(user=request.user)
        
        # Aplicar filtros
        state = request.query_params.get('state')
        if state:
            procedures = procedures.filter(state=state)
        
        serializer = self.get_serializer(procedures, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtiene estadísticas de trámites del usuario"""
        user = request.user
        
        if user.is_staff:
            procedures = Procedure.objects.all()
        else:
            procedures = Procedure.objects.filter(user=user)
        
        stats = {
            'total': procedures.count(),
            'borrador': procedures.filter(state='BORRADOR').count(),
            'enviado': procedures.filter(state='ENVIADO').count(),
            'en_proceso': procedures.filter(state='EN_PROCESO').count(),
            'requiere_info': procedures.filter(state='REQUIERE_INFO').count(),
            'aprobado': procedures.filter(state='APROBADO').count(),
            'rechazado': procedures.filter(state='RECHAZADO').count(),
            'finalizado': procedures.filter(state='FINALIZADO').count(),
        }
        
        return Response(stats)
