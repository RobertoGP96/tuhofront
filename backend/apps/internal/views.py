from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.template.loader import render_to_string
from django.http import HttpResponse
# from weasyprint import HTML
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from .models import (
    Guest, FeedingDays, FeedingProcedure, AccommodationProcedure,
    TransportProcedureType, TransportProcedure, MaintanceProcedureType,
    MaintancePriority, MaintanceProcedure
)
from apps.platform.models import Department, Area, Note
from .serializers import (
    GuestSerializer, FeedingDaysSerializer, FeedingProcedureSerializer,
    AccommodationProcedureSerializer, TransportProcedureTypeSerializer,
    TransportProcedureSerializer, MaintanceProcedureTypeSerializer,
    MaintancePrioritySerializer, MaintanceProcedureSerializer, DepartmentSerializer, AreaSerializer, NoteSerializer
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

# CRUD para Guest
@extend_schema(
    tags=['Guests - Huéspedes'],
    description='Gestionar invitados/huéspedes del sistema'
)
class GuestListCreateView(ListCreateAPIView):
    """
    Listar todos los huéspedes o crear uno nuevo.
    
    GET: Retorna lista paginada de todos los huéspedes registrados
    POST: Crea un nuevo huésped
    """
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

@extend_schema(
    tags=['Guests - Huéspedes'],
    description='Operaciones CRUD en un huésped específico'
)
class GuestRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """
    Obtener, actualizar o eliminar un huésped específico.
    
    GET: Retorna los detalles de un huésped
    PUT: Actualiza completamente un huésped
    PATCH: Actualiza parcialmente un huésped
    DELETE: Elimina un huésped
    """
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

# CRUD para FeedingDays
@extend_schema(
    tags=['Feeding Days - Días de Alimentación'],
    description='Gestionar los días de alimentación disponibles'
)
class FeedingDaysListCreateView(ListCreateAPIView):
    """
    Listar todos los días de alimentación o crear uno nuevo.
    """
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer

@extend_schema(
    tags=['Feeding Days - Días de Alimentación']
)
class FeedingDaysRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un día de alimentación específico."""
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer

# CRUD para FeedingProcedure
@extend_schema(
    tags=['Feeding Procedures - Trámites de Alimentación'],
    description='Gestionar solicitudes de alimentación'
)
class FeedingProcedureListCreateView(ListCreateAPIView):
    """
    Listar todos los trámites de alimentación o crear uno nuevo.
    
    GET: Retorna lista de solicitudes de alimentación
    POST: Crea una nueva solicitud de alimentación
    """
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer

@extend_schema(
    tags=['Feeding Procedures - Trámites de Alimentación']
)
class FeedingProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un trámite de alimentación específico."""
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer

# CRUD para AccommodationProcedure
@extend_schema(
    tags=['Accommodation Procedures - Trámites de Hospedaje'],
    description='Gestionar solicitudes de alojamiento'
)
class AccommodationProcedureListCreateView(ListCreateAPIView):
    """
    Listar todos los trámites de hospedaje o crear uno nuevo.
    
    GET: Retorna lista de solicitudes de hospedaje
    POST: Crea una nueva solicitud de hospedaje
    """
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer

@extend_schema(
    tags=['Accommodation Procedures - Trámites de Hospedaje']
)
class AccommodationProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un trámite de hospedaje específico."""
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer

# CRUD para TransportProcedureType
@extend_schema(
    tags=['Transport Types - Tipos de Transporte'],
    description='Gestionar tipos de transporte disponibles'
)
class TransportProcedureTypeListCreateView(ListCreateAPIView):
    """Listar o crear tipos de transporte."""
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer

@extend_schema(
    tags=['Transport Types - Tipos de Transporte']
)
class TransportProcedureTypeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un tipo de transporte específico."""
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer

# CRUD para TransportProcedure
@extend_schema(
    tags=['Transport Procedures - Trámites de Transporte'],
    description='Gestionar solicitudes de transporte'
)
class TransportProcedureListCreateView(ListCreateAPIView):
    """
    Listar todos los trámites de transporte o crear uno nuevo.
    
    GET: Retorna lista de solicitudes de transporte
    POST: Crea una nueva solicitud de transporte
    """
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer

@extend_schema(
    tags=['Transport Procedures - Trámites de Transporte']
)
class TransportProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un trámite de transporte específico."""
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer

# CRUD para MaintanceProcedureType
@extend_schema(
    tags=['Maintenance Types - Tipos de Mantenimiento'],
    description='Gestionar tipos de mantenimiento'
)
class MaintanceProcedureTypeListCreateView(ListCreateAPIView):
    """Listar o crear tipos de mantenimiento."""
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer

@extend_schema(
    tags=['Maintenance Types - Tipos de Mantenimiento']
)
class MaintanceProcedureTypeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un tipo de mantenimiento específico."""
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer

# CRUD para MaintancePriority
@extend_schema(
    tags=['Maintenance Priority - Prioridades de Mantenimiento'],
    description='Gestionar niveles de prioridad de mantenimiento'
)
class MaintancePriorityListCreateView(ListCreateAPIView):
    """Listar o crear prioridades de mantenimiento."""
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer

@extend_schema(
    tags=['Maintenance Priority - Prioridades de Mantenimiento']
)
class MaintancePriorityRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en una prioridad específica."""
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer

# CRUD para MaintenanceProcedure
@extend_schema(
    tags=['Maintenance Procedures - Trámites de Mantenimiento'],
    description='Gestionar solicitudes de mantenimiento'
)
class MaintanceProcedureListCreateView(ListCreateAPIView):
    """
    Listar todos los trámites de mantenimiento o crear uno nuevo.
    
    GET: Retorna lista de solicitudes de mantenimiento
    POST: Crea una nueva solicitud de mantenimiento
    """
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer

@extend_schema(
    tags=['Maintenance Procedures - Trámites de Mantenimiento']
)
class MaintanceProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un trámite de mantenimiento específico."""
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer
    
# CRUD para Department
@extend_schema(
    tags=['Departments - Departamentos'],
    description='Gestionar departamentos'
)
class DepartmentListCreateView(ListCreateAPIView):
    """Listar o crear departamentos."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
@extend_schema(
    tags=['Departments - Departamentos']
)
class DepartmentRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un departamento específico."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
# CRUD para Area
@extend_schema(
    tags=['Areas - Áreas'],
    description='Gestionar áreas'
)
class AreaListCreateView(ListCreateAPIView):
    """Listar o crear áreas."""
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    
@extend_schema(
    tags=['Areas - Áreas']
)
class AreaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en un área específica."""
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    
# CRUD para Note
@extend_schema(
    tags=['Notes - Notas'],
    description='Gestionar notas'
)
class NoteListCreateView(ListCreateAPIView):
    """Listar o crear notas."""
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    
@extend_schema(
    tags=['Notes - Notas']
)
class NoteRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """Operaciones CRUD en una nota específica."""
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    
@extend_schema(
    tags=['Procedures - Trámites Generales'],
    description='Obtener todos los trámites de todas las categorías',
    responses={200: {'type': 'object', 'properties': {'procedures': {'type': 'array'}}}}
)
@api_view(['GET'])
def get_all_procedures(request):
    """
    GET /internal/procedures/
    
    Retorna todos los trámites del sistema agrupados por tipo:
    - Alimentación
    - Hospedaje
    - Transporte
    - Mantenimiento
    """
    try:
        # Obtener todos los trámites
        feeding_procedures = FeedingProcedure.objects.all()
        accommodation_procedures = AccommodationProcedure.objects.all()
        transport_procedures = TransportProcedure.objects.all()
        maintance_procedures = MaintanceProcedure.objects.all()

        # Serializar los datos
        feeding_serializer = FeedingProcedureSerializer(
            feeding_procedures, many=True, context={'request': request}
        ) if feeding_procedures.exists() else []
        accommodation_serializer = AccommodationProcedureSerializer(
            accommodation_procedures, many=True, context={'request': request}
        ) if accommodation_procedures.exists() else []
        transport_serializer = TransportProcedureSerializer(
            transport_procedures, many=True, context={'request': request}
        ) if transport_procedures.exists() else []
        maintance_serializer = MaintanceProcedureSerializer(
            maintance_procedures, many=True, context={'request': request}
        ) if maintance_procedures.exists() else []

        # Concatenar los datos serializados
        data = (
            feeding_serializer.data
            + accommodation_serializer.data
            + transport_serializer.data
            + maintance_serializer.data
        )

        return Response(
            {
                "procedures": data,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print(f"Error al obtener los trámites: {e}")
        return Response(
            {"error": "Ocurrió un error al obtener los trámites."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@extend_schema(
    tags=['Procedures - Trámites Generales'],
    description='Obtener estadísticas de trámites',
    parameters=[
        OpenApiParameter(
            name='type',
            description='Filtrar por tipo de trámite: feeding, accommodation, transport, maintance',
            required=False,
            type=str
        )
    ],
    responses={200: {'type': 'object', 'properties': {'stats': {'type': 'object'}}}}
)
@api_view(['GET'])
def get_procedure_stats(request):
    """
    GET /internal/stats/?type=feeding
    
    Retorna estadísticas de trámites por estado.
    
    Parámetros:
    - type (opcional): feeding, accommodation, transport, maintance
    """
    procedure_type = request.query_params.get('type', None)

    # Filtrar por tipo de trámite si se proporciona
    if procedure_type == 'feeding':
        procedures = FeedingProcedure.objects.all()
    elif procedure_type == 'accommodation':
        procedures = AccommodationProcedure.objects.all()
    elif procedure_type == 'transport':
        procedures = TransportProcedure.objects.all()
    elif procedure_type == 'maintance':
        procedures = MaintanceProcedure.objects.all()
    else:
        # Combinar todos los trámites
        procedures = list(FeedingProcedure.objects.all()) + \
                     list(AccommodationProcedure.objects.all()) + \
                     list(TransportProcedure.objects.all()) + \
                     list(MaintanceProcedure.objects.all())

    # Agrupar por estado
    stats = {}
    for procedure in procedures:
        state = procedure.state
        stats[state] = stats.get(state, 0) + 1

    # Ordenar los estados según el orden deseado
    ordered_states = ['PENDIENTE', 'APROBADO', 'CANCELADO', 'RECHAZADO', 'FINALIZADO']
    ordered_stats = {state: stats.get(state, 0) for state in ordered_states}

    return Response({"stats": ordered_stats}, status=status.HTTP_200_OK)

# PDF

# def print_feeding_procedure_pdf(request, pk):
#     procedure = FeedingProcedure.objects.select_related('user', 'department', 'area').get(pk=pk)
#     html_string = render_to_string('feeding_procedure_pdf.html', {'procedure': procedure})
#     pdf = HTML(string=html_string).write_pdf()
#     response = HttpResponse(pdf, content_type='application/pdf')
#     response['Content-Disposition'] = f'inline; filename="tramite_alimentacion_{pk}.pdf"'
#     return response

# def print_accommodation_procedure_pdf(request, pk):
#     procedure = AccommodationProcedure.objects.select_related('user', 'department', 'area').prefetch_related('guests', 'feeding_days').get(pk=pk)
#     html_string = render_to_string('accommodation_procedure_pdf.html', {'procedure': procedure})
#     pdf = HTML(string=html_string).write_pdf()
#     response = HttpResponse(pdf, content_type='application/pdf')
#     response['Content-Disposition'] = f'inline; filename="tramite_hospedaje_{pk}.pdf"'
#     return response

# def print_transport_procedure_pdf(request, pk):
#     procedure = TransportProcedure.objects.select_related(
#         'user', 'department', 'area', 'procedure_type'
#     ).get(pk=pk)
#     html_string = render_to_string('transport_procedure_pdf.html', {'procedure': procedure})
#     pdf = HTML(string=html_string).write_pdf()
#     response = HttpResponse(pdf, content_type='application/pdf')
#     response['Content-Disposition'] = f'inline; filename="tramite_transporte_{pk}.pdf"'
#     return response

# def print_maintance_procedure_pdf(request, pk):
#     procedure = MaintanceProcedure.objects.select_related(
#         'user', 'department', 'area', 'procedure_type', 'priority'
#     ).get(pk=pk)
#     html_string = render_to_string('maintance_procedure_pdf.html', {'procedure': procedure, 'request': request})
#     pdf = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
#     response = HttpResponse(pdf, content_type='application/pdf')
#     response['Content-Disposition'] = f'inline; filename="tramite_mantenimiento_{pk}.pdf"'
#     return response