"""
Serializers para el sistema de reserva de locales universitarios.

Proporciona serialización y deserialización de datos para la API REST.
"""

from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    Local,
    LocalReservation,
    ReservationHistory,
    LocalTypeEnum,
    ReservationStateEnum,
    ReservationPurposeEnum,
)

User = get_user_model()


# ============================================================================
# SERIALIZERS DE LOCAL
# ============================================================================

class LocalListSerializer(serializers.ModelSerializer):
    """Serializer para listado de locales (información resumida)"""
    
    local_type_display = serializers.CharField(
        source='get_local_type_display',
        read_only=True
    )
    
    total_reservations = serializers.SerializerMethodField()
    
    class Meta:
        model = Local
        fields = [
            'id',
            'name',
            'code',
            'local_type',
            'local_type_display',
            'capacity',
            'is_active',
            'requires_approval',
            'image',
            'total_reservations',
        ]
        read_only_fields = ['id']
    
    def get_total_reservations(self, obj):
        """Cuenta el número total de reservas del local"""
        return obj.reservations.filter(
            state__in=[
                ReservationStateEnum.APROBADA,
                ReservationStateEnum.EN_CURSO,
            ]
        ).count()


class LocalDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado de local"""
    
    local_type_display = serializers.CharField(
        source='get_local_type_display',
        read_only=True
    )
    
    upcoming_reservations = serializers.SerializerMethodField()
    is_available_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Local
        fields = [
            'id',
            'name',
            'code',
            'local_type',
            'local_type_display',
            'capacity',
            'description',
            'image',
            'is_active',
            'requires_approval',
            'created_at',
            'updated_at',
            'upcoming_reservations',
            'is_available_now',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_upcoming_reservations(self, obj):
        """Obtiene las próximas 5 reservas del local"""
        reservations = obj.reservations.filter(
            state=ReservationStateEnum.APROBADA,
            start_time__gte=timezone.now()
        ).order_by('start_time')[:5]
        
        return [{
            'id': str(res.id),
            'start_time': res.start_time,
            'end_time': res.end_time,
            'purpose': res.get_purpose_display(),
            'responsible_name': res.responsible_name,
        } for res in reservations]
    
    def get_is_available_now(self, obj):
        """Verifica si el local está disponible ahora"""
        now = timezone.now()
        return obj.is_available(now, now + timezone.timedelta(hours=1))


class LocalCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar locales"""
    
    class Meta:
        model = Local
        fields = [
            'name',
            'code',
            'local_type',
            'capacity',
            'description',
            'image',
            'is_active',
            'requires_approval',
        ]
    
    def validate_capacity(self, value):
        """Valida que la capacidad sea mayor a 0"""
        if value <= 0:
            raise serializers.ValidationError(
                "La capacidad debe ser mayor a 0"
            )
        return value
    
    def validate_code(self, value):
        """Valida que el código sea único (en actualización)"""
        instance = self.instance
        if instance and Local.objects.exclude(pk=instance.pk).filter(code=value).exists():
            raise serializers.ValidationError(
                "Ya existe un local con este código"
            )
        return value.upper()


class LocalAvailabilitySerializer(serializers.Serializer):
    """Serializer para verificar disponibilidad de un local"""
    
    start_time = serializers.DateTimeField(required=True)
    end_time = serializers.DateTimeField(required=True)
    exclude_reservation_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate(self, data):
        """Validaciones personalizadas"""
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({
                'end_time': 'La hora de fin debe ser posterior a la hora de inicio'
            })
        
        if data['start_time'] < timezone.now():
            raise serializers.ValidationError({
                'start_time': 'No se pueden verificar fechas en el pasado'
            })
        
        return data


# ============================================================================
# SERIALIZERS DE USUARIO
# ============================================================================

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico de usuario para relaciones"""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Obtiene el nombre completo del usuario"""
        return obj.get_full_name() if hasattr(obj, 'get_full_name') else str(obj)


# ============================================================================
# SERIALIZERS DE RESERVA
# ============================================================================

class ReservationListSerializer(serializers.ModelSerializer):
    """Serializer para listado de reservas (información resumida)"""
    
    local_name = serializers.CharField(source='local.name', read_only=True)
    local_code = serializers.CharField(source='local.code', read_only=True)
    user_name = serializers.SerializerMethodField()
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = LocalReservation
        fields = [
            'id',
            'follow_number',
            'local',
            'local_name',
            'local_code',
            'user',
            'user_name',
            'start_time',
            'end_time',
            'duration_hours',
            'state',
            'state_display',
            'purpose',
            'purpose_display',
            'expected_attendees',
            'responsible_name',
            'created_at',
        ]
        read_only_fields = ['id', 'follow_number', 'created_at']
    
    def get_user_name(self, obj):
        """Obtiene el nombre del usuario solicitante"""
        return obj.user.get_full_name() if hasattr(obj.user, 'get_full_name') else str(obj.user)


class ReservationDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado de reserva"""
    
    local = LocalListSerializer(read_only=True)
    user = UserBasicSerializer(read_only=True)
    approved_by = UserBasicSerializer(read_only=True)
    
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    
    duration_hours = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    can_be_edited = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    
    class Meta:
        model = LocalReservation
        fields = [
            'id',
            'follow_number',
            'local',
            'user',
            'start_time',
            'end_time',
            'duration_hours',
            'duration_minutes',
            'purpose',
            'purpose_display',
            'purpose_detail',
            'expected_attendees',
            'responsible_name',
            'responsible_phone',
            'responsible_email',
            'setup_requirements',
            'state',
            'state_display',
            'observation',
            'deadline',
            'approved_by',
            'approved_at',
            'rejection_reason',
            'cancellation_reason',
            'created_at',
            'updated_at',
            # Propiedades computadas
            'is_active',
            'is_upcoming',
            'is_past',
            'can_be_edited',
            'can_be_cancelled',
        ]
        read_only_fields = [
            'id',
            'follow_number',
            'user',
            'state',
            'approved_by',
            'approved_at',
            'rejection_reason',
            'cancellation_reason',
            'created_at',
            'updated_at',
        ]


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear reservas"""
    
    class Meta:
        model = LocalReservation
        fields = [
            'local',
            'start_time',
            'end_time',
            'purpose',
            'purpose_detail',
            'expected_attendees',
            'responsible_name',
            'responsible_phone',
            'responsible_email',
            'setup_requirements',
            'observation',
        ]
    
    def validate(self, data):
        """Validaciones personalizadas"""
        # Validar horarios
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({
                'end_time': 'La hora de fin debe ser posterior a la hora de inicio'
            })
        
        # Validar que sea futura
        if data['start_time'] <= timezone.now():
            raise serializers.ValidationError({
                'start_time': 'No se pueden hacer reservas en el pasado'
            })
        
        # Validar duración
        duration = data['end_time'] - data['start_time']
        if duration.total_seconds() < 30 * 60:
            raise serializers.ValidationError({
                'end_time': 'La duración mínima es de 30 minutos'
            })
        
        if duration.total_seconds() > 8 * 3600:
            raise serializers.ValidationError({
                'end_time': 'La duración máxima es de 8 horas'
            })
        
        # Validar capacidad
        if data['expected_attendees'] > data['local'].capacity:
            raise serializers.ValidationError({
                'expected_attendees': f"El número de asistentes excede la capacidad del local ({data['local'].capacity})"
            })
        
        # Validar disponibilidad
        if not data['local'].is_available(data['start_time'], data['end_time']):
            raise serializers.ValidationError({
                'local': 'El local no está disponible en el horario seleccionado'
            })
        
        return data
    
    def create(self, validated_data):
        """Crea la reserva con el usuario del request"""
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['state'] = ReservationStateEnum.BORRADOR
        return super().create(validated_data)


class ReservationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar reservas"""
    
    class Meta:
        model = LocalReservation
        fields = [
            'local',
            'start_time',
            'end_time',
            'purpose',
            'purpose_detail',
            'expected_attendees',
            'responsible_name',
            'responsible_phone',
            'responsible_email',
            'setup_requirements',
            'observation',
        ]
    
    def validate(self, data):
        """Validaciones personalizadas"""
        instance = self.instance
        
        # Solo se pueden editar reservas en borrador o pendientes
        if instance.state not in [ReservationStateEnum.BORRADOR, ReservationStateEnum.PENDIENTE]:
            raise serializers.ValidationError(
                "Solo se pueden editar reservas en borrador o pendientes"
            )
        
        # Validar horarios si se modificaron
        start_time = data.get('start_time', instance.start_time)
        end_time = data.get('end_time', instance.end_time)
        
        if start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'La hora de fin debe ser posterior a la hora de inicio'
            })
        
        if start_time <= timezone.now():
            raise serializers.ValidationError({
                'start_time': 'No se pueden hacer reservas en el pasado'
            })
        
        # Validar duración
        duration = end_time - start_time
        if duration.total_seconds() < 30 * 60:
            raise serializers.ValidationError({
                'end_time': 'La duración mínima es de 30 minutos'
            })
        
        if duration.total_seconds() > 8 * 3600:
            raise serializers.ValidationError({
                'end_time': 'La duración máxima es de 8 horas'
            })
        
        # Validar capacidad
        local = data.get('local', instance.local)
        expected_attendees = data.get('expected_attendees', instance.expected_attendees)
        
        if expected_attendees > local.capacity:
            raise serializers.ValidationError({
                'expected_attendees': f"El número de asistentes excede la capacidad del local ({local.capacity})"
            })
        
        # Validar disponibilidad
        if not local.is_available(start_time, end_time, exclude_reservation=instance):
            raise serializers.ValidationError({
                'local': 'El local no está disponible en el horario seleccionado'
            })
        
        return data


class ReservationSubmitSerializer(serializers.Serializer):
    """Serializer para enviar una reserva"""
    
    def validate(self, data):
        """Valida que se pueda enviar la reserva"""
        instance = self.instance
        
        if instance.state != ReservationStateEnum.BORRADOR:
            raise serializers.ValidationError(
                "Solo se pueden enviar reservas en borrador"
            )
        
        return data


class ReservationApproveSerializer(serializers.Serializer):
    """Serializer para aprobar una reserva"""
    
    observation = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Valida que se pueda aprobar la reserva"""
        instance = self.instance
        
        if instance.state != ReservationStateEnum.PENDIENTE:
            raise serializers.ValidationError(
                "Solo se pueden aprobar reservas pendientes"
            )
        
        return data


class ReservationRejectSerializer(serializers.Serializer):
    """Serializer para rechazar una reserva"""
    
    rejection_reason = serializers.CharField(
        required=True,
        help_text="Motivo del rechazo"
    )
    
    def validate(self, data):
        """Valida que se pueda rechazar la reserva"""
        instance = self.instance
        
        if instance.state != ReservationStateEnum.PENDIENTE:
            raise serializers.ValidationError(
                "Solo se pueden rechazar reservas pendientes"
            )
        
        if not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Debe proporcionar un motivo de rechazo'
            })
        
        return data


class ReservationCancelSerializer(serializers.Serializer):
    """Serializer para cancelar una reserva"""
    
    cancellation_reason = serializers.CharField(
        required=True,
        help_text="Motivo de la cancelación"
    )
    
    def validate(self, data):
        """Valida que se pueda cancelar la reserva"""
        instance = self.instance
        
        if instance.state not in [ReservationStateEnum.PENDIENTE, ReservationStateEnum.APROBADA]:
            raise serializers.ValidationError(
                "No se puede cancelar esta reserva"
            )
        
        if instance.start_time <= timezone.now():
            raise serializers.ValidationError(
                "No se puede cancelar una reserva en curso o pasada"
            )
        
        if not data.get('cancellation_reason'):
            raise serializers.ValidationError({
                'cancellation_reason': 'Debe proporcionar un motivo de cancelación'
            })
        
        return data


# ============================================================================
# SERIALIZERS DE HISTORIAL
# ============================================================================

class ReservationHistorySerializer(serializers.ModelSerializer):
    """Serializer para el historial de reservas"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ReservationHistory
        fields = [
            'id',
            'user',
            'action',
            'details',
            'timestamp',
        ]
        read_only_fields = fields
        

# ============================================================================
# SERIALIZERS DE ESTADÍSTICAS
# ============================================================================

class LocalStatisticsSerializer(serializers.Serializer):
    """Serializer para estadísticas de un local"""
    
    total_reservations = serializers.IntegerField()
    approved_reservations = serializers.IntegerField()
    pending_reservations = serializers.IntegerField()
    rejected_reservations = serializers.IntegerField()
    cancelled_reservations = serializers.IntegerField()
    upcoming_reservations = serializers.IntegerField()
    average_duration_hours = serializers.FloatField()
    most_common_purpose = serializers.CharField()


class ReservationCalendarSerializer(serializers.Serializer):
    """Serializer para vista de calendario de reservas"""
    
    date = serializers.DateField()
    reservations = serializers.SerializerMethodField()
    
    def get_reservations(self, obj):
        """Obtiene las reservas del día"""
        return ReservationListSerializer(obj['reservations'], many=True).data
