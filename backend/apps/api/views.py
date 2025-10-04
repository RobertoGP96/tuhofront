from rest_framework import viewsets

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import generics

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import Group

from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

# Imports para documentación con Spectacular
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

import uuid

# Imports de permisos personalizados
from .permissions import IsOwnerOrReadOnly, IsOwnerOrStaff, IsStaffOrReadOnly, IsAdminOrReadOnly

# Imports de modelos y serializers
from .models import Area
from atencion_poblacion.models import AtencionPoblacion
from notificaciones.models import Notificacion
from notificaciones.models import Usuario
from plataforma.models import Noticias, Email, EstadosTramites
from secretaria_docente.models import Tramite
from internal_procedures.models import (
    Guest, FeedingDays, Department, Area as InternalArea, Note,
    FeedingProcedure, AccommodationProcedure, TransportProcedure, 
    TransportProcedureType, MaintanceProcedure, MaintanceProcedureType, 
    MaintancePriority
)

# Imports de serializers
from usuarios.serializers import UsuarioSerializer
from notificaciones.serializers import NotificacionSerializer
from atencion_poblacion.serializers import AtencionPoblacionSerializer
from plataforma.serializers import NoticiaSerializer, EmailSerializer, EstadosTramitesSerializer
from secretaria_docente.serializers import TramiteSerializer
from internal_procedures.serializers import (
    GuestSerializer, FeedingDaysSerializer, DepartmentSerializer, 
    AreaSerializer as InternalAreaSerializer, NoteSerializer,
    FeedingProcedureSerializer, AccommodationProcedureSerializer,
    TransportProcedureSerializer, TransportProcedureTypeSerializer,
    MaintanceProcedureSerializer, MaintanceProcedureTypeSerializer,
    MaintancePrioritySerializer
)
from .serializers import (
    ApiAreaSerializer, 
    TokenValidationSerializer, 
    PasswordResetRequestSerializer, 
    PasswordResetResponseSerializer,
    UserProfileResponseSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="Listar usuarios",
        description="Obtiene una lista paginada de todos los usuarios del sistema. Solo disponible para administradores.",
        tags=["Usuarios"]
    ),
    create=extend_schema(
        summary="Crear usuario",
        description="Crea un nuevo usuario en el sistema. Solo disponible para administradores.",
        tags=["Usuarios"]
    ),
    retrieve=extend_schema(
        summary="Obtener usuario",
        description="Obtiene los detalles de un usuario específico por su ID.",
        tags=["Usuarios"]
    ),
    update=extend_schema(
        summary="Actualizar usuario",
        description="Actualiza completamente un usuario existente.",
        tags=["Usuarios"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente usuario",
        description="Actualiza parcialmente un usuario existente.",
        tags=["Usuarios"]
    ),
    destroy=extend_schema(
        summary="Eliminar usuario",
        description="Elimina un usuario del sistema. Solo disponible para administradores.",
        tags=["Usuarios"]
    )
)
class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios del sistema.
    
    Proporciona operaciones CRUD completas para la gestión de usuarios.
    Acceso restringido solo a administradores del sistema.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]  # Solo administradores pueden gestionar usuarios


@extend_schema_view(
    list=extend_schema(
        summary="Listar notificaciones",
        description="Obtiene una lista paginada de notificaciones. Los usuarios pueden ver solo sus notificaciones, el staff puede ver todas.",
        tags=["Notificaciones"]
    ),
    create=extend_schema(
        summary="Crear notificación",
        description="Crea una nueva notificación en el sistema. Solo disponible para el staff.",
        tags=["Notificaciones"]
    ),
    retrieve=extend_schema(
        summary="Obtener notificación",
        description="Obtiene los detalles de una notificación específica.",
        tags=["Notificaciones"]
    ),
    update=extend_schema(
        summary="Actualizar notificación",
        description="Actualiza completamente una notificación existente.",
        tags=["Notificaciones"]
    ),
    partial_update=extend_schema(
        summary="Marcar como leída",
        description="Actualiza parcialmente una notificación, típicamente para marcarla como leída.",
        tags=["Notificaciones"]
    ),
    destroy=extend_schema(
        summary="Eliminar notificación",
        description="Elimina una notificación del sistema.",
        tags=["Notificaciones"]
    )
)
class NotificacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar notificaciones del sistema.
    
    Las notificaciones permiten comunicar información importante a los usuarios.
    Los usuarios solo pueden ver sus propias notificaciones, mientras que el staff
    puede gestionar todas las notificaciones.
    """
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [IsStaffOrReadOnly]  # Staff puede crear, todos pueden leer


@extend_schema_view(
    list=extend_schema(
        summary="Listar solicitudes de atención",
        description="Obtiene las solicitudes de atención a la población. Los usuarios ven solo las suyas, el staff ve todas.",
        tags=["Atención a la Población"]
    ),
    create=extend_schema(
        summary="Crear solicitud de atención",
        description="Crea una nueva solicitud de atención a la población.",
        tags=["Atención a la Población"]
    ),
    retrieve=extend_schema(
        summary="Obtener solicitud de atención",
        description="Obtiene los detalles de una solicitud específica.",
        tags=["Atención a la Población"]
    ),
    update=extend_schema(
        summary="Actualizar solicitud",
        description="Actualiza completamente una solicitud de atención.",
        tags=["Atención a la Población"]
    ),
    partial_update=extend_schema(
        summary="Actualizar estado de solicitud",
        description="Actualiza parcialmente una solicitud, típicamente para cambiar su estado.",
        tags=["Atención a la Población"]
    ),
    destroy=extend_schema(
        summary="Eliminar solicitud",
        description="Elimina una solicitud de atención del sistema.",
        tags=["Atención a la Población"]
    )
)
class AtencionPoblacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar solicitudes de atención a la población.
    
    Permite a los ciudadanos crear solicitudes de atención y al personal
    administrativo gestionar y dar seguimiento a estas solicitudes.
    """
    queryset = AtencionPoblacion.objects.all()
    serializer_class = AtencionPoblacionSerializer
    permission_classes = [IsOwnerOrStaff]  # Usuarios ven solo los suyos, staff ve todos


# ViewSets para Plataforma
@extend_schema_view(
    list=extend_schema(
        summary="Listar noticias",
        description="Obtiene una lista de noticias ordenadas por fecha de creación (más recientes primero).",
        tags=["Plataforma - Noticias"]
    ),
    create=extend_schema(
        summary="Crear noticia",
        description="Crea una nueva noticia en el sistema. Solo disponible para el staff.",
        tags=["Plataforma - Noticias"]
    ),
    retrieve=extend_schema(
        summary="Obtener noticia",
        description="Obtiene los detalles completos de una noticia específica.",
        tags=["Plataforma - Noticias"]
    ),
    update=extend_schema(
        summary="Actualizar noticia",
        description="Actualiza completamente una noticia existente.",
        tags=["Plataforma - Noticias"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente noticia",
        description="Actualiza parcialmente una noticia existente.",
        tags=["Plataforma - Noticias"]
    ),
    destroy=extend_schema(
        summary="Eliminar noticia",
        description="Elimina una noticia del sistema.",
        tags=["Plataforma - Noticias"]
    )
)
class NoticiasViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar noticias y anuncios del sistema.
    
    Las noticias son visibles para todos los usuarios, pero solo el personal
    autorizado puede crear, modificar o eliminar contenido.
    """
    queryset = Noticias.objects.all()
    serializer_class = NoticiaSerializer
    permission_classes = [IsStaffOrReadOnly]  # Todos pueden leer, solo staff puede escribir
    
    def get_queryset(self):
        queryset = Noticias.objects.all().order_by('-on_create')
        return queryset


@extend_schema_view(
    list=extend_schema(
        summary="Listar configuraciones de email",
        description="Obtiene las configuraciones SMTP para el envío de emails. Solo disponible para administradores.",
        tags=["Plataforma - Email"]
    ),
    create=extend_schema(
        summary="Crear configuración de email",
        description="Crea una nueva configuración SMTP para el sistema.",
        tags=["Plataforma - Email"]
    ),
    retrieve=extend_schema(
        summary="Obtener configuración de email",
        description="Obtiene los detalles de una configuración SMTP específica.",
        tags=["Plataforma - Email"]
    ),
    update=extend_schema(
        summary="Actualizar configuración de email",
        description="Actualiza completamente una configuración SMTP.",
        tags=["Plataforma - Email"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente configuración",
        description="Actualiza parcialmente una configuración SMTP.",
        tags=["Plataforma - Email"]
    ),
    destroy=extend_schema(
        summary="Eliminar configuración de email",
        description="Elimina una configuración SMTP del sistema.",
        tags=["Plataforma - Email"]
    )
)
class EmailViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar configuraciones de email SMTP.
    
    Permite configurar los parámetros necesarios para el envío de correos
    electrónicos desde el sistema. Acceso restringido a administradores.
    """
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    permission_classes = [IsAdminUser]  # Solo administradores


@extend_schema_view(
    list=extend_schema(
        summary="Listar estados de trámites",
        description="Obtiene todos los estados disponibles para los trámites del sistema.",
        tags=["Plataforma - Estados"]
    ),
    create=extend_schema(
        summary="Crear estado de trámite",
        description="Crea un nuevo estado para los trámites. Solo disponible para el staff.",
        tags=["Plataforma - Estados"]
    ),
    retrieve=extend_schema(
        summary="Obtener estado de trámite",
        description="Obtiene los detalles de un estado específico.",
        tags=["Plataforma - Estados"]
    ),
    update=extend_schema(
        summary="Actualizar estado de trámite",
        description="Actualiza completamente un estado de trámite.",
        tags=["Plataforma - Estados"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente estado",
        description="Actualiza parcialmente un estado de trámite.",
        tags=["Plataforma - Estados"]
    ),
    destroy=extend_schema(
        summary="Eliminar estado de trámite",
        description="Elimina un estado de trámite del sistema.",
        tags=["Plataforma - Estados"]
    )
)
class EstadosTramitesViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar estados de trámites.
    
    Define y gestiona los diferentes estados que pueden tener los trámites
    en el sistema (pendiente, en proceso, completado, rechazado, etc.).
    """
    queryset = EstadosTramites.objects.all()
    serializer_class = EstadosTramitesSerializer
    permission_classes = [IsStaffOrReadOnly]  # Solo staff puede modificar estados


# ViewSets para Secretaría Docente
@extend_schema_view(
    list=extend_schema(
        summary="Listar trámites de secretaría",
        description="Obtiene los trámites de secretaría docente. Los usuarios ven solo los suyos, el staff ve todos.",
        tags=["Secretaría Docente"]
    ),
    create=extend_schema(
        summary="Crear trámite de secretaría",
        description="Crea un nuevo trámite en la secretaría docente.",
        tags=["Secretaría Docente"]
    ),
    retrieve=extend_schema(
        summary="Obtener trámite de secretaría",
        description="Obtiene los detalles de un trámite específico.",
        tags=["Secretaría Docente"]
    ),
    update=extend_schema(
        summary="Actualizar trámite",
        description="Actualiza completamente un trámite de secretaría.",
        tags=["Secretaría Docente"]
    ),
    partial_update=extend_schema(
        summary="Actualizar estado del trámite",
        description="Actualiza parcialmente un trámite, típicamente para cambiar su estado.",
        tags=["Secretaría Docente"]
    ),
    destroy=extend_schema(
        summary="Eliminar trámite",
        description="Elimina un trámite de secretaría del sistema.",
        tags=["Secretaría Docente"]
    )
)
class TramiteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar trámites de la secretaría docente.
    
    Los estudiantes pueden crear y consultar sus propios trámites,
    mientras que el personal de secretaría puede gestionar todos los trámites.
    """
    queryset = Tramite.objects.all()
    serializer_class = TramiteSerializer
    permission_classes = [IsOwnerOrStaff]  # Usuarios ven solo los suyos
    
    def get_queryset(self):
        queryset = Tramite.objects.all()
        if not self.request.user.is_staff:
            # Los usuarios normales solo ven sus propios trámites
            queryset = queryset.filter(usuario=self.request.user)
        return queryset.order_by('-fecha')
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


# ViewSets para Internal Procedures
@extend_schema_view(
    list=extend_schema(
        summary="Listar huéspedes",
        description="Obtiene una lista de todos los huéspedes registrados en el sistema.",
        tags=["Procedimientos Internos - Huéspedes"]
    ),
    create=extend_schema(
        summary="Registrar huésped",
        description="Registra un nuevo huésped en el sistema.",
        tags=["Procedimientos Internos - Huéspedes"]
    ),
    retrieve=extend_schema(
        summary="Obtener huésped",
        description="Obtiene los detalles de un huésped específico.",
        tags=["Procedimientos Internos - Huéspedes"]
    ),
    update=extend_schema(
        summary="Actualizar huésped",
        description="Actualiza completamente la información de un huésped.",
        tags=["Procedimientos Internos - Huéspedes"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente huésped",
        description="Actualiza parcialmente la información de un huésped.",
        tags=["Procedimientos Internos - Huéspedes"]
    ),
    destroy=extend_schema(
        summary="Eliminar huésped",
        description="Elimina un huésped del sistema.",
        tags=["Procedimientos Internos - Huéspedes"]
    )
)
class GuestViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar huéspedes del sistema.
    
    Permite registrar y gestionar información de huéspedes
    que utilizan los servicios de la institución.
    """
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated]


@extend_schema_view(
    list=extend_schema(
        summary="Listar días de alimentación",
        description="Obtiene los días de alimentación configurados en el sistema.",
        tags=["Procedimientos Internos - Alimentación"]
    ),
    create=extend_schema(
        summary="Crear día de alimentación",
        description="Crea un nuevo día de alimentación disponible.",
        tags=["Procedimientos Internos - Alimentación"]
    ),
    retrieve=extend_schema(
        summary="Obtener día de alimentación",
        description="Obtiene los detalles de un día de alimentación específico.",
        tags=["Procedimientos Internos - Alimentación"]
    ),
    update=extend_schema(
        summary="Actualizar día de alimentación",
        description="Actualiza completamente un día de alimentación.",
        tags=["Procedimientos Internos - Alimentación"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente día",
        description="Actualiza parcialmente un día de alimentación.",
        tags=["Procedimientos Internos - Alimentación"]
    ),
    destroy=extend_schema(
        summary="Eliminar día de alimentación",
        description="Elimina un día de alimentación del sistema.",
        tags=["Procedimientos Internos - Alimentación"]
    )
)
class FeedingDaysViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar días de alimentación.
    
    Define los días disponibles para los servicios de alimentación
    en los procedimientos internos.
    """
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer
    permission_classes = [IsAuthenticated]


@extend_schema_view(
    list=extend_schema(
        summary="Listar departamentos internos",
        description="Obtiene todos los departamentos internos de la institución.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    create=extend_schema(
        summary="Crear departamento interno",
        description="Crea un nuevo departamento interno. Solo disponible para el staff.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    retrieve=extend_schema(
        summary="Obtener departamento interno",
        description="Obtiene los detalles de un departamento interno específico.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    update=extend_schema(
        summary="Actualizar departamento interno",
        description="Actualiza completamente un departamento interno.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente departamento",
        description="Actualiza parcialmente un departamento interno.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    destroy=extend_schema(
        summary="Eliminar departamento interno",
        description="Elimina un departamento interno del sistema.",
        tags=["Procedimientos Internos - Estructura"]
    )
)
class InternalDepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar departamentos internos.
    
    Gestiona la estructura organizacional interna de la institución
    para los procedimientos administrativos.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsStaffOrReadOnly]


@extend_schema_view(
    list=extend_schema(
        summary="Listar áreas internas",
        description="Obtiene todas las áreas internas de la institución.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    create=extend_schema(
        summary="Crear área interna",
        description="Crea una nueva área interna. Solo disponible para el staff.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    retrieve=extend_schema(
        summary="Obtener área interna",
        description="Obtiene los detalles de un área interna específica.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    update=extend_schema(
        summary="Actualizar área interna",
        description="Actualiza completamente un área interna.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente área",
        description="Actualiza parcialmente un área interna.",
        tags=["Procedimientos Internos - Estructura"]
    ),
    destroy=extend_schema(
        summary="Eliminar área interna",
        description="Elimina un área interna del sistema.",
        tags=["Procedimientos Internos - Estructura"]
    )
)
class InternalAreaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar áreas internas.
    
    Define las diferentes áreas funcionales dentro de cada departamento
    para una mejor organización de los procedimientos.
    """
    queryset = InternalArea.objects.all()
    serializer_class = InternalAreaSerializer
    permission_classes = [IsStaffOrReadOnly]


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsStaffOrReadOnly]  # Solo staff puede crear notas


class FeedingProcedureViewSet(viewsets.ModelViewSet):
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = FeedingProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccommodationProcedureViewSet(viewsets.ModelViewSet):
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = AccommodationProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        summary="Listar tipos de transporte",
        description="Obtiene todos los tipos de procedimientos de transporte disponibles.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    create=extend_schema(
        summary="Crear tipo de transporte",
        description="Crea un nuevo tipo de procedimiento de transporte. Solo disponible para el staff.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    retrieve=extend_schema(
        summary="Obtener tipo de transporte",
        description="Obtiene los detalles de un tipo de transporte específico.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    update=extend_schema(
        summary="Actualizar tipo de transporte",
        description="Actualiza completamente un tipo de transporte.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente tipo",
        description="Actualiza parcialmente un tipo de transporte.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    destroy=extend_schema(
        summary="Eliminar tipo de transporte",
        description="Elimina un tipo de transporte del sistema.",
        tags=["🚗 Procedimientos - Transporte"]
    )
)
class TransportProcedureTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tipos de procedimientos de transporte.
    
    Define las diferentes categorías de servicios de transporte
    disponibles en la institución.
    """
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


@extend_schema_view(
    list=extend_schema(
        summary="Listar solicitudes de transporte",
        description="Obtiene las solicitudes de transporte. Los usuarios ven solo las suyas, el staff ve todas.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    create=extend_schema(
        summary="Crear solicitud de transporte",
        description="Crea una nueva solicitud de transporte.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    retrieve=extend_schema(
        summary="Obtener solicitud de transporte",
        description="Obtiene los detalles de una solicitud de transporte específica.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    update=extend_schema(
        summary="Actualizar solicitud de transporte",
        description="Actualiza completamente una solicitud de transporte.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    partial_update=extend_schema(
        summary="Actualizar estado de solicitud",
        description="Actualiza parcialmente una solicitud, típicamente para cambiar su estado.",
        tags=["🚗 Procedimientos - Transporte"]
    ),
    destroy=extend_schema(
        summary="Eliminar solicitud de transporte",
        description="Elimina una solicitud de transporte del sistema.",
        tags=["🚗 Procedimientos - Transporte"]
    )
)
class TransportProcedureViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar solicitudes de transporte.
    
    Permite a los usuarios crear solicitudes de transporte y al personal
    administrativo gestionar y dar seguimiento a estas solicitudes.
    """
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = TransportProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema_view(
    list=extend_schema(
        summary="Listar tipos de mantenimiento",
        description="Obtiene todos los tipos de procedimientos de mantenimiento disponibles.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    create=extend_schema(
        summary="Crear tipo de mantenimiento",
        description="Crea un nuevo tipo de procedimiento de mantenimiento. Solo disponible para el staff.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    retrieve=extend_schema(
        summary="Obtener tipo de mantenimiento",
        description="Obtiene los detalles de un tipo de mantenimiento específico.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    update=extend_schema(
        summary="Actualizar tipo de mantenimiento",
        description="Actualiza completamente un tipo de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente tipo",
        description="Actualiza parcialmente un tipo de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    destroy=extend_schema(
        summary="Eliminar tipo de mantenimiento",
        description="Elimina un tipo de mantenimiento del sistema.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    )
)
class MaintanceProcedureTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tipos de procedimientos de mantenimiento.
    
    Define las diferentes categorías de servicios de mantenimiento
    y reparaciones disponibles.
    """
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


@extend_schema_view(
    list=extend_schema(
        summary="Listar prioridades de mantenimiento",
        description="Obtiene todos los niveles de prioridad para procedimientos de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    create=extend_schema(
        summary="Crear prioridad de mantenimiento",
        description="Crea un nuevo nivel de prioridad para mantenimiento. Solo disponible para el staff.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    retrieve=extend_schema(
        summary="Obtener prioridad de mantenimiento",
        description="Obtiene los detalles de una prioridad de mantenimiento específica.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    update=extend_schema(
        summary="Actualizar prioridad de mantenimiento",
        description="Actualiza completamente una prioridad de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente prioridad",
        description="Actualiza parcialmente una prioridad de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    destroy=extend_schema(
        summary="Eliminar prioridad de mantenimiento",
        description="Elimina una prioridad de mantenimiento del sistema.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    )
)
class MaintancePriorityViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar prioridades de mantenimiento.
    
    Define los diferentes niveles de urgencia y prioridad
    para las solicitudes de mantenimiento.
    """
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer
    permission_classes = [IsStaffOrReadOnly]


@extend_schema_view(
    list=extend_schema(
        summary="Listar solicitudes de mantenimiento",
        description="Obtiene las solicitudes de mantenimiento. Los usuarios ven solo las suyas, el staff ve todas.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    create=extend_schema(
        summary="Crear solicitud de mantenimiento",
        description="Crea una nueva solicitud de mantenimiento o reparación.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    retrieve=extend_schema(
        summary="Obtener solicitud de mantenimiento",
        description="Obtiene los detalles de una solicitud de mantenimiento específica.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    update=extend_schema(
        summary="Actualizar solicitud de mantenimiento",
        description="Actualiza completamente una solicitud de mantenimiento.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    partial_update=extend_schema(
        summary="Actualizar estado de solicitud",
        description="Actualiza parcialmente una solicitud, típicamente para cambiar su estado o prioridad.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    ),
    destroy=extend_schema(
        summary="Eliminar solicitud de mantenimiento",
        description="Elimina una solicitud de mantenimiento del sistema.",
        tags=["🔧 Procedimientos - Mantenimiento"]
    )
)
class MaintanceProcedureViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar solicitudes de mantenimiento.
    
    Permite a los usuarios reportar problemas y solicitar reparaciones,
    mientras que el personal técnico puede gestionar y dar seguimiento
    a las solicitudes según su prioridad.
    """
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = MaintanceProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@extend_schema(
    summary="Iniciar sesión",
    description="Autentica un usuario y devuelve tokens JWT para acceso a la API.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "username": {"type": "string", "description": "Nombre de usuario"},
                "password": {"type": "string", "description": "Contraseña del usuario"}
            },
            "required": ["username", "password"]
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "user": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "username": {"type": "string"},
                        "email": {"type": "string"},
                        "first_name": {"type": "string"},
                        "last_name": {"type": "string"},
                        "groups": {"type": "array", "items": {"type": "string"}}
                    }
                },
                "access": {"type": "string", "description": "Token de acceso JWT"},
                "refresh": {"type": "string", "description": "Token de renovación JWT"},
                "message": {"type": "string"}
            }
        },
        400: {"description": "Faltan credenciales"},
        401: {"description": "Credenciales incorrectas o cuenta inactiva"}
    },
    tags=["🔐 Autenticación"]
)
class Login(APIView):
    """
    Vista para autenticación de usuarios.
    
    Permite a los usuarios iniciar sesión con sus credenciales y obtener
    tokens JWT para acceder a los endpoints protegidos de la API.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"message": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_auth = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({"response": "incorrecto", "message": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user_to_auth.username, password=password)
        if user is not None:
            if not user.is_active:
                return Response({"response": "incorrecto", "message": "Account is not activated"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            usuario = Usuario.objects.get(id=user.id)
            user_info = {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
                "first_name": usuario.first_name,
                "last_name": usuario.last_name,
                "groups": [group.name for group in usuario.groups.all()],
            }
            
            return Response({
                "user": user_info,
                "access": str(access_token),
                "refresh": str(refresh),
                "message": "Login successful"
            }, status=status.HTTP_200_OK)
        else:
            return Response({"response": "incorrecto", "message": "Account information is incorrect"}, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(
    summary="Cerrar sesión",
    description="Invalida el token de renovación del usuario para cerrar sesión de forma segura.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "refresh": {"type": "string", "description": "Token de renovación JWT"}
            },
            "required": ["refresh"]
        }
    },
    responses={
        200: {"description": "Sesión cerrada exitosamente"},
        400: {"description": "Token de renovación requerido o inválido"}
    },
    tags=["🔐 Autenticación"]
)       
class Logout(APIView):
    """
    Vista para cerrar sesión de usuarios.
    
    Invalida el token de renovación proporcionado, añadiéndolo a la lista
    negra para prevenir su uso futuro.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    summary="Registrar usuario",
    description="Crea una nueva cuenta de usuario en el sistema. El usuario será creado en estado inactivo y requerirá activación.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "username": {"type": "string", "description": "Nombre de usuario único"},
                "email": {"type": "string", "format": "email", "description": "Correo electrónico único"},
                "password1": {"type": "string", "description": "Contraseña"},
                "password2": {"type": "string", "description": "Confirmación de contraseña"},
                "first_name": {"type": "string", "description": "Nombre del usuario"},
                "last_name": {"type": "string", "description": "Apellido del usuario"}
            },
            "required": ["username", "email", "password1", "password2"]
        }
    },
    responses={
        201: {"description": "Usuario creado exitosamente"},
        400: {"description": "Error en los datos proporcionados (usuario/email ya existe, contraseñas no coinciden, etc.)"}
    },
    tags=["🔐 Autenticación"]
)
class Register(APIView):
    """
    Vista para registro de nuevos usuarios.
    
    Permite crear nuevas cuentas de usuario en el sistema. Los usuarios
    se crean en estado inactivo y se les asigna el grupo "Usuario" por defecto.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if Usuario.objects.filter(username=username).exists():
            return Response({"message": "Ya existe una cuenta con ese usuario."}, status=status.HTTP_400_BAD_REQUEST)

        if Usuario.objects.filter(email=email).exists():
            return Response({"message": "Ya existe una cuenta con ese email."}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"message": "Las contraseñas deben coincidir."}, status=status.HTTP_400_BAD_REQUEST)

        usuario = Usuario(
            username=username, 
            email=email, 
            first_name=first_name,
            last_name=last_name,
            token_activacion=str(uuid.uuid4()), 
            is_active=False
        )
        usuario.set_password(password1)

        try:
            usuario.save()
            default_group, created = Group.objects.get_or_create(name="Usuario")
            usuario.groups.add(default_group)

            # Enviar correo de verificación
            subject = "Verificación de cuenta"
            message = f'Hola, acceda a este enlace para validar su cuenta: {settings.DOMAIN}/api/verify/{usuario.token_activacion}/'
            recipient_list = [usuario.email]
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)

            return Response({"message": "Su cuenta ha sido creada con éxito, verifique su email para validar su cuenta."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": "Algo salió mal realizando el registro, por favor intente de nuevo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@extend_schema(
    summary="Validar token de activación",
    description="Valida el token de activación de una cuenta de usuario y la activa.",
    parameters=[
        OpenApiParameter(
            name='token',
            description='Token de activación enviado por email',
            required=True,
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH
        )
    ],
    responses={
        200: TokenValidationSerializer,
        400: TokenValidationSerializer
    },
    tags=["Autenticación"]
)
class TokenValidationView(APIView):
    """
    Vista para validar tokens de activación de cuentas.
    
    Permite activar cuentas de usuario mediante el token enviado por email
    durante el proceso de registro.
    """
    permission_classes = [AllowAny]
    serializer_class = TokenValidationSerializer
    
    def get(self, request, token):
        try:
            profile_obj = Usuario.objects.filter(token_activacion=token).first()
            if profile_obj:
                if profile_obj.is_active:
                    return Response({"message": "Su cuenta ya está verificada."}, status=status.HTTP_200_OK)
                profile_obj.is_active = True
                profile_obj.save()
                return Response({"message": "Su cuenta ha sido verificada."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No existe una cuenta con ese token o la verificación ha expirado."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": "Ha ocurrido un error, por favor intente de nuevo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    summary="Solicitar restablecimiento de contraseña",
    description="Envía un email con instrucciones para restablecer la contraseña.",
    request=PasswordResetRequestSerializer,
    responses={
        200: PasswordResetResponseSerializer,
        400: PasswordResetResponseSerializer
    },
    tags=["Autenticación"]
)
class PasswordResetRequestView(APIView):
    """
    Vista para solicitar restablecimiento de contraseña.
    
    Permite a los usuarios solicitar un restablecimiento de contraseña
    mediante su dirección de email.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer 
    
    def post(self, request):
        email = request.data.get('email')
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            # Generar token y enviar correo
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Enviar correo con el enlace para restablecer la contraseña
            subject = "Restablecimiento de contraseña"
            message = f'Acceda a este enlace para restablecer su contraseña: {settings.DOMAIN}/api/reset/{uid}/{token}/'
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            return Response({"message": "Se ha enviado un correo para restablecer la contraseña."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "No existe una cuenta con ese email."}, status=status.HTTP_400_BAD_REQUEST)

                            


@extend_schema(
    summary="Obtener perfil de usuario",
    description="Obtiene la información completa del perfil del usuario autenticado.",
    responses={
        200: UserProfileResponseSerializer,
        401: {"description": "No autenticado"}
    },
    tags=["Autenticación"]
)
class UserProfileView(APIView):
    """
    Vista para obtener información del perfil del usuario autenticado.
    
    Retorna información completa del usuario incluyendo grupos y permisos.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileResponseSerializer
    
    def get(self, request):
        user = request.user
        user_info = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "groups": [group.name for group in user.groups.all()],
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        return Response({"user": user_info}, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(
        summary="Listar áreas",
        description="Obtiene una lista de todas las áreas del sistema.",
        tags=["Estructura - Áreas"]
    ),
    create=extend_schema(
        summary="Crear área",
        description="Crea una nueva área en el sistema. Solo disponible para administradores.",
        tags=["Estructura - Áreas"]
    )
)
class AreaCreateView(generics.ListCreateAPIView):
    """
    Vista para crear y listar áreas de la API general.
    
    Proporciona endpoints para gestionar las áreas básicas del sistema.
    """
    queryset = Area.objects.all()
    serializer_class = ApiAreaSerializer
    permission_classes = [IsAdminUser] 