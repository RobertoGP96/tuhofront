"""
Views y ViewSets para el sistema de reserva de locales universitarios.

Proporciona endpoints REST para gestionar locales y reservas.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.db.models import Q, Count, Avg, F
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta

from .models import (
    Local,
    LocalReservation,
    ReservationHistory,
    LocalTypeEnum,
    ReservationStateEnum,
    ReservationPurposeEnum,
)
from .serializers import (
    LocalListSerializer,
    LocalDetailSerializer,
    LocalCreateUpdateSerializer,
    LocalAvailabilitySerializer,
    ReservationListSerializer,
    ReservationDetailSerializer,
    ReservationCreateSerializer,
    ReservationUpdateSerializer,
    ReservationSubmitSerializer,
    ReservationApproveSerializer,
    ReservationRejectSerializer,
    ReservationCancelSerializer,
    ReservationHistorySerializer,
    LocalStatisticsSerializer,
    ReservationCalendarSerializer,
)
from .permissions import IsReservationOwnerOrAdmin, CanApproveReservations


# ============================================================================
# PERMISOS PERSONALIZADOS
# ============================================================================

class IsOwnerOrReadOnly(IsAuthenticated):
    """Permiso para que solo el propietario pueda editar"""
    
    def has_object_permission(self, request, view, obj):
        # Lectura permitida para todos los autenticados
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Escritura solo para el propietario
        return obj.user == request.user


# ============================================================================
# VIEWSET DE LOCALES
# ============================================================================

class LocalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar locales.
    
    Endpoints:
    - GET /api/locals/ - Listar locales
    - GET /api/locals/{id}/ - Detalle de local
    - POST /api/locals/ - Crear local (admin)
    - PUT/PATCH /api/locals/{id}/ - Actualizar local (admin)
    - DELETE /api/locals/{id}/ - Eliminar local (admin)
    - GET /api/locals/{id}/availability/ - Verificar disponibilidad
    - GET /api/locals/{id}/reservations/ - Reservas del local
    - GET /api/locals/{id}/statistics/ - Estadísticas del local
    - GET /api/locals/active/ - Solo locales activos
    """
    
    queryset = Local.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['local_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'capacity', 'created_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'list':
            return LocalListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return LocalCreateUpdateSerializer
        elif self.action == 'availability':
            return LocalAvailabilitySerializer
        elif self.action == 'statistics':
            return LocalStatisticsSerializer
        return LocalDetailSerializer
    
    def get_permissions(self):
        """Define permisos según la acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Optimiza queryset con select_related y prefetch_related"""
        queryset = super().get_queryset()
        
        if self.action == 'list':
            queryset = queryset.prefetch_related('reservations')
        elif self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'reservations__user',
                'reservations__approved_by'
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        GET /api/locals/active/
        Retorna solo los locales activos
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def availability(self, request, pk=None):
        """
        POST /api/locals/{id}/availability/
        Verifica si el local está disponible en un rango de tiempo
        
        Body:
        {
            "start_time": "2024-01-15T10:00:00Z",
            "end_time": "2024-01-15T12:00:00Z",
            "exclude_reservation_id": "uuid" (opcional)
        }
        """
        local = self.get_object()
        serializer = LocalAvailabilitySerializer(data=request.data)
        
        if serializer.is_valid():
            start_time = serializer.validated_data['start_time']
            end_time = serializer.validated_data['end_time']
            exclude_reservation_id = serializer.validated_data.get('exclude_reservation_id')
            
            # Buscar reserva a excluir si se proporciona
            exclude_reservation = None
            if exclude_reservation_id:
                try:
                    exclude_reservation = LocalReservation.objects.get(
                        id=exclude_reservation_id
                    )
                except LocalReservation.DoesNotExist:
                    pass
            
            is_available = local.is_available(
                start_time,
                end_time,
                exclude_reservation=exclude_reservation
            )
            
            response_data = {
                'is_available': is_available,
                'local': LocalListSerializer(local).data,
                'start_time': start_time,
                'end_time': end_time,
            }
            
            if not is_available:
                # Obtener reservas conflictivas
                conflicting = LocalReservation.objects.filter(
                    local=local,
                    state__in=[
                        ReservationStateEnum.APROBADA,
                        ReservationStateEnum.EN_CURSO,
                        ReservationStateEnum.PENDIENTE,
                    ],
                ).filter(
                    Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
                )
                
                if exclude_reservation:
                    conflicting = conflicting.exclude(id=exclude_reservation.id)
                
                response_data['conflicting_reservations'] = ReservationListSerializer(
                    conflicting,
                    many=True
                ).data
            
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def reservations(self, request, pk=None):
        """
        GET /api/locals/{id}/reservations/
        Obtiene todas las reservas del local
        
        Query params:
        - state: Filtrar por estado
        - date_from: Desde fecha
        - date_to: Hasta fecha
        """
        local = self.get_object()
        queryset = local.reservations.all()
        
        # Filtros opcionales
        state = request.query_params.get('state')
        if state:
            queryset = queryset.filter(state=state)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(start_time__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(end_time__lte=date_to)
        
        serializer = ReservationListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        GET /api/locals/{id}/statistics/
        Obtiene estadísticas del local
        """
        local = self.get_object()
        reservations = local.reservations.all()
        
        stats = {
            'total_reservations': reservations.count(),
            'approved_reservations': reservations.filter(
                state=ReservationStateEnum.APROBADA
            ).count(),
            'pending_reservations': reservations.filter(
                state=ReservationStateEnum.PENDIENTE
            ).count(),
            'rejected_reservations': reservations.filter(
                state=ReservationStateEnum.RECHAZADA
            ).count(),
            'cancelled_reservations': reservations.filter(
                state=ReservationStateEnum.CANCELADA
            ).count(),
            'upcoming_reservations': reservations.filter(
                state=ReservationStateEnum.APROBADA,
                start_time__gte=timezone.now()
            ).count(),
            'average_duration_hours': 0,
            'most_common_purpose': None,
        }
        
        # Calcular duración promedio
        approved = reservations.filter(state=ReservationStateEnum.APROBADA)
        if approved.exists():
            durations = [r.duration_hours for r in approved]
            stats['average_duration_hours'] = sum(durations) / len(durations)
        
        # Propósito más común
        purpose_counts = reservations.values('purpose').annotate(
            count=Count('purpose')
        ).order_by('-count').first()
        
        if purpose_counts:
            stats['most_common_purpose'] = dict(
                ReservationPurposeEnum.choices
            ).get(purpose_counts['purpose'])
        
        serializer = LocalStatisticsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def calendar(self, request, pk=None):
        """
        GET /api/locals/{id}/calendar/?month=2024-01
        Obtiene las reservas del local organizadas por día para un mes
        """
        local = self.get_object()
        month_str = request.query_params.get('month')
        
        if not month_str:
            return Response(
                {'error': 'Se requiere el parámetro month (formato: YYYY-MM)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            year, month = map(int, month_str.split('-'))
            start_date = datetime(year, month, 1)
            
            # Calcular último día del mes
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            # Obtener reservas del mes
            reservations = local.reservations.filter(
                state__in=[ReservationStateEnum.APROBADA, ReservationStateEnum.EN_CURSO],
                start_time__gte=start_date,
                start_time__lt=end_date
            ).order_by('start_time')
            
            # Organizar por día
            calendar_data = {}
            for reservation in reservations:
                date_key = reservation.start_time.date().isoformat()
                if date_key not in calendar_data:
                    calendar_data[date_key] = []
                calendar_data[date_key].append(
                    ReservationListSerializer(reservation).data
                )
            
            return Response({
                'month': month_str,
                'local': LocalListSerializer(local).data,
                'calendar': calendar_data
            })
            
        except (ValueError, TypeError):
            return Response(
                {'error': 'Formato de mes inválido. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================================================
# VIEWSET DE RESERVAS
# ============================================================================

class LocalReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reservas de locales.
    
    Endpoints:
    - GET /api/reservations/ - Listar reservas
    - GET /api/reservations/{id}/ - Detalle de reserva
    - POST /api/reservations/ - Crear reserva
    - PUT/PATCH /api/reservations/{id}/ - Actualizar reserva
    - DELETE /api/reservations/{id}/ - Eliminar reserva
    - POST /api/reservations/{id}/submit/ - Enviar para aprobación
    - POST /api/reservations/{id}/approve/ - Aprobar (staff)
    - POST /api/reservations/{id}/reject/ - Rechazar (staff)
    - POST /api/reservations/{id}/cancel/ - Cancelar
    - GET /api/reservations/{id}/history/ - Historial de cambios
    - GET /api/reservations/my_reservations/ - Mis reservas
    - GET /api/reservations/pending/ - Pendientes de aprobación (staff)
    """
    
    queryset = LocalReservation.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['state', 'purpose', 'local', 'user']
    search_fields = ['follow_number', 'responsible_name', 'purpose_detail']
    ordering_fields = ['start_time', 'created_at', 'state']
    ordering = ['-start_time']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'list':
            return ReservationListSerializer
        elif self.action == 'create':
            return ReservationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReservationUpdateSerializer
        elif self.action == 'submit':
            return ReservationSubmitSerializer
        elif self.action == 'approve':
            return ReservationApproveSerializer
        elif self.action == 'reject':
            return ReservationRejectSerializer
        elif self.action == 'cancel':
            return ReservationCancelSerializer
        elif self.action == 'history':
            return ReservationHistorySerializer
        return ReservationDetailSerializer
    
    def get_permissions(self):
        """Define permisos según la acción"""
        if self.action in ['approve', 'reject', 'pending']:
            return [CanApproveReservations()]
        elif self.action in ['update', 'partial_update', 'destroy', 'cancel']:
            return [IsReservationOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Optimiza queryset y filtra según permisos"""
        queryset = super().get_queryset().select_related(
            'local',
            'user',
            'approved_by'
        )
        
        # Si no es staff, solo puede ver sus propias reservas
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        """Crea la reserva con el usuario autenticado"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_reservations(self, request):
        """
        GET /api/reservations/my_reservations/
        Obtiene las reservas del usuario autenticado
        """
        queryset = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[CanApproveReservations])
    def pending(self, request):
        """
        GET /api/reservations/pending/
        Obtiene todas las reservas pendientes de aprobación (solo staff)
        """
        queryset = LocalReservation.objects.filter(
            state=ReservationStateEnum.PENDIENTE
        ).select_related('local', 'user').order_by('start_time')
        
        serializer = ReservationListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        GET /api/reservations/upcoming/
        Obtiene las próximas reservas aprobadas del usuario
        """
        queryset = self.get_queryset().filter(
            state=ReservationStateEnum.APROBADA,
            start_time__gte=timezone.now()
        ).order_by('start_time')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        GET /api/reservations/active/
        Obtiene las reservas activas (en curso) del usuario
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            state__in=[ReservationStateEnum.APROBADA, ReservationStateEnum.EN_CURSO],
            start_time__lte=now,
            end_time__gte=now
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        POST /api/reservations/{id}/submit/
        Envía la reserva para aprobación
        """
        reservation = self.get_object()
        serializer = self.get_serializer(reservation, data=request.data)
        
        if serializer.is_valid():
            try:
                reservation.submit()
                
                # Registrar en historial
                ReservationHistory.objects.create(
                    reservation=reservation,
                    user=request.user,
                    action='SUBMITTED',
                    details={'message': 'Reserva enviada para aprobación'}
                )
                
                return Response(
                    ReservationDetailSerializer(reservation).data,
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[CanApproveReservations])
    def approve(self, request, pk=None):
        """
        POST /api/reservations/{id}/approve/
        Aprueba una reserva (solo staff)
        
        Body:
        {
            "observation": "Comentario opcional"
        }
        """
        reservation = self.get_object()
        serializer = self.get_serializer(reservation, data=request.data)
        
        if serializer.is_valid():
            try:
                reservation.approve(request.user)
                
                # Actualizar observación si se proporciona
                if 'observation' in serializer.validated_data:
                    reservation.observation = serializer.validated_data['observation']
                    reservation.save()
                
                # Registrar en historial
                ReservationHistory.objects.create(
                    reservation=reservation,
                    user=request.user,
                    action='APPROVED',
                    details={
                        'message': 'Reserva aprobada',
                        'observation': serializer.validated_data.get('observation', '')
                    }
                )
                
                return Response(
                    ReservationDetailSerializer(reservation).data,
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[CanApproveReservations])
    def reject(self, request, pk=None):
        """
        POST /api/reservations/{id}/reject/
        Rechaza una reserva (solo staff)
        
        Body:
        {
            "rejection_reason": "Motivo del rechazo"
        }
        """
        reservation = self.get_object()
        serializer = self.get_serializer(reservation, data=request.data)
        
        if serializer.is_valid():
            try:
                reservation.reject(serializer.validated_data['rejection_reason'])
                
                # Registrar en historial
                ReservationHistory.objects.create(
                    reservation=reservation,
                    user=request.user,
                    action='REJECTED',
                    details={
                        'message': 'Reserva rechazada',
                        'reason': serializer.validated_data['rejection_reason']
                    }
                )
                
                return Response(
                    ReservationDetailSerializer(reservation).data,
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        POST /api/reservations/{id}/cancel/
        Cancela una reserva
        
        Body:
        {
            "cancellation_reason": "Motivo de la cancelación"
        }
        """
        reservation = self.get_object()
        serializer = self.get_serializer(reservation, data=request.data)
        
        if serializer.is_valid():
            try:
                reservation.cancel(serializer.validated_data['cancellation_reason'])
                
                # Registrar en historial
                ReservationHistory.objects.create(
                    reservation=reservation,
                    user=request.user,
                    action='CANCELLED',
                    details={
                        'message': 'Reserva cancelada',
                        'reason': serializer.validated_data['cancellation_reason']
                    }
                )
                
                return Response(
                    ReservationDetailSerializer(reservation).data,
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        GET /api/reservations/{id}/history/
        Obtiene el historial de cambios de la reserva
        """
        reservation = self.get_object()
        history = reservation.history.all()
        serializer = ReservationHistorySerializer(history, many=True)
        return Response(serializer.data)
