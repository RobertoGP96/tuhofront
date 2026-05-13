from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _

from apps.internal.permissions import is_tramites_staff

from ..models.procedure import Procedure
from ..serializers.procedure import (
    ProcedureSerializer,
    ProcedureDetailSerializer,
    ProcedureListSerializer
)

# Gestores de otros módulos no deben ver/operar trámites externos.
_FOREIGN_MODULE_ROLES = ('GESTOR_INTERNO', 'GESTOR_RESERVAS')


class ProcedureViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Procedures (trámites).
    
    Proporciona operaciones CRUD y acciones adicionales para trámites.
    """
    
    queryset = Procedure.objects.select_related('user').select_subclasses()
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
        user_type = getattr(user, 'user_type', '')

        # Gestores de otros módulos quedan completamente fuera.
        if user_type in _FOREIGN_MODULE_ROLES:
            return Procedure.objects.none()

        # Admin, staff y GESTOR_TRAMITES ven todos los trámites
        if user.is_staff or is_tramites_staff(user):
            return Procedure.objects.select_related('user').select_subclasses()

        # Usuarios normales solo ven sus propios trámites
        return Procedure.objects.filter(user=user).select_related('user').select_subclasses()
    
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
        """Acción para aprobar un trámite (admin o GESTOR_TRAMITES)"""
        if not (request.user.is_staff or is_tramites_staff(request.user)):
            return Response(
                {'error': _('No autorizado para aprobar trámites')},
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
        """Obtiene estadísticas de trámites del usuario.

        Una sola query con ``aggregate(Count(...))`` en vez de 8 queries
        secuenciales (N+1).
        """
        from django.db.models import Count, Q

        user = request.user
        user_type = getattr(user, 'user_type', '')
        if user_type in _FOREIGN_MODULE_ROLES:
            procedures = Procedure.objects.none()
        elif user.is_staff or is_tramites_staff(user):
            procedures = Procedure.objects.all()
        else:
            procedures = Procedure.objects.filter(user=user)

        agg = procedures.aggregate(
            total=Count('id'),
            borrador=Count('id', filter=Q(state='BORRADOR')),
            enviado=Count('id', filter=Q(state='ENVIADO')),
            en_proceso=Count('id', filter=Q(state='EN_PROCESO')),
            requiere_info=Count('id', filter=Q(state='REQUIERE_INFO')),
            aprobado=Count('id', filter=Q(state='APROBADO')),
            rechazado=Count('id', filter=Q(state='RECHAZADO')),
            finalizado=Count('id', filter=Q(state='FINALIZADO')),
        )

        return Response(agg)
