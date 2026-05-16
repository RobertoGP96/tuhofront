from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils.translation import gettext_lazy as _

from apps.internal.models import (
    FeedingProcedure,
    AccommodationProcedure,
    TransportProcedure,
    MaintanceProcedure,
)
from apps.internal.permissions import is_secretaria_staff
from apps.secretary_doc.models import SecretaryDocProcedure

from ..models.procedure import Procedure
from ..serializers.procedure import (
    ProcedureSerializer,
    ProcedureDetailSerializer,
    ProcedureListSerializer
)

_INTERNAL_SUBCLASSES = (
    FeedingProcedure,
    AccommodationProcedure,
    TransportProcedure,
    MaintanceProcedure,
)
_SECRETARIA_SUBCLASSES = (SecretaryDocProcedure,)

# Cada rol de gestor solo ve los trámites de su módulo. GESTOR_RESERVAS no
# tiene subclases de Procedure (las reservas viven en apps/labs).
_SUBCLASSES_BY_ROLE = {
    'GESTOR_INTERNO': _INTERNAL_SUBCLASSES,
    'GESTOR_SECRETARIA': _SECRETARIA_SUBCLASSES,
    'GESTOR_RESERVAS': (),
}


def _subclass_filter(subclasses):
    """Q que limita un queryset de Procedure a filas que sean instancias de
    alguna de las subclases dadas (herencia multi-tabla).

    Para cada subclase ``Foo`` existe un reverse OneToOne ``foo`` (lowercase
    ``_meta.model_name``); filtrar por ``foo__isnull=False`` deja solo las
    filas que tienen una contraparte en la tabla hija.
    """
    q = Q()
    for subcls in subclasses:
        q |= Q(**{f"{subcls._meta.model_name}__isnull": False})
    return q


def _scope_procedure_queryset(user):
    """Filtra Procedure según el rol del usuario, aislando módulos.

    - Superuser / is_staff / ADMIN ven todos los módulos.
    - Cada GESTOR_* ve solo las subclases de su módulo.
    - Usuario normal ve solo sus propios trámites (de cualquier módulo).
    """
    base = Procedure.objects.select_related('user')

    if not user or not user.is_authenticated:
        return Procedure.objects.none()

    user_type = getattr(user, 'user_type', '') or ''

    if user.is_superuser or user.is_staff or user_type == 'ADMIN':
        return base.select_subclasses()

    if user_type in _SUBCLASSES_BY_ROLE:
        subclasses = _SUBCLASSES_BY_ROLE[user_type]
        if not subclasses:
            return Procedure.objects.none()
        return (
            base.filter(_subclass_filter(subclasses))
            .select_subclasses(*subclasses)
        )

    # USUARIO y cualquier otro rol: solo sus propios trámites.
    return base.filter(user=user).select_subclasses()


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
        """Filtra trámites según permisos del usuario y módulo del gestor."""
        return _scope_procedure_queryset(self.request.user)
    
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
        """Acción para aprobar un trámite (admin o GESTOR_SECRETARIA)"""
        if not (request.user.is_staff or is_secretaria_staff(request.user)):
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

        # Reutilizamos el mismo scoping que get_queryset para que las
        # estadísticas no expongan trámites de otros módulos al gestor.
        procedures = _scope_procedure_queryset(request.user)

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
