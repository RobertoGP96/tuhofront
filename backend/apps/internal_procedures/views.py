from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.template.loader import render_to_string
from django.http import HttpResponse
from weasyprint import HTML
from .models import (
    Guest, FeedingDays, FeedingProcedure, AccommodationProcedure,
    TransportProcedureType, TransportProcedure, MaintanceProcedureType,
    MaintancePriority, MaintanceProcedure, Department, Area, Note
)
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
class GuestListCreateView(ListCreateAPIView):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

class GuestRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer

# CRUD para FeedingDays
class FeedingDaysListCreateView(ListCreateAPIView):
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer

class FeedingDaysRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer

# CRUD para FeedingProcedure
class FeedingProcedureListCreateView(ListCreateAPIView):
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer

class FeedingProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer

# CRUD para AccommodationProcedure
class AccommodationProcedureListCreateView(ListCreateAPIView):
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer

class AccommodationProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer

# CRUD para TransportProcedureType
class TransportProcedureTypeListCreateView(ListCreateAPIView):
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer

class TransportProcedureTypeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer

# CRUD para TransportProcedure
class TransportProcedureListCreateView(ListCreateAPIView):
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer

class TransportProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer

# CRUD para MaintanceProcedureType
class MaintanceProcedureTypeListCreateView(ListCreateAPIView):
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer

class MaintanceProcedureTypeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer

# CRUD para MaintancePriority
class MaintancePriorityListCreateView(ListCreateAPIView):
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer

class MaintancePriorityRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer

# CRUD para MaintenanceProcedure
class MaintanceProcedureListCreateView(ListCreateAPIView):
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer

class MaintanceProcedureRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer
    
# CRUD para Department
class DepartmentListCreateView(ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
class DepartmentRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
# CRUD para Area
class AreaListCreateView(ListCreateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    
class AreaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    
# CRUD para Note
class NoteListCreateView(ListCreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    
class NoteRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    
@api_view(['GET'])
def get_all_procedures(request):
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

@api_view(['GET'])
def get_procedure_stats(request):
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

def print_feeding_procedure_pdf(request, pk):
    procedure = FeedingProcedure.objects.select_related('user', 'department', 'area').get(pk=pk)
    html_string = render_to_string('feeding_procedure_pdf.html', {'procedure': procedure})
    pdf = HTML(string=html_string).write_pdf()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="tramite_alimentacion_{pk}.pdf"'
    return response

def print_accommodation_procedure_pdf(request, pk):
    procedure = AccommodationProcedure.objects.select_related('user', 'department', 'area').prefetch_related('guests', 'feeding_days').get(pk=pk)
    html_string = render_to_string('accommodation_procedure_pdf.html', {'procedure': procedure})
    pdf = HTML(string=html_string).write_pdf()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="tramite_hospedaje_{pk}.pdf"'
    return response

def print_transport_procedure_pdf(request, pk):
    procedure = TransportProcedure.objects.select_related(
        'user', 'department', 'area', 'procedure_type'
    ).get(pk=pk)
    html_string = render_to_string('transport_procedure_pdf.html', {'procedure': procedure})
    pdf = HTML(string=html_string).write_pdf()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="tramite_transporte_{pk}.pdf"'
    return response

def print_maintance_procedure_pdf(request, pk):
    procedure = MaintanceProcedure.objects.select_related(
        'user', 'department', 'area', 'procedure_type', 'priority'
    ).get(pk=pk)
    html_string = render_to_string('maintance_procedure_pdf.html', {'procedure': procedure, 'request': request})
    pdf = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="tramite_mantenimiento_{pk}.pdf"'
    return response