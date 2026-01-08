from .models import Tramite
from rest_framework import viewsets, permissions
from .serializers import TramiteSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=['Secretary Doc - Trámites de Secretaría'],
    description='Gestionar trámites académicos de secretaría'
)
class TramiteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar trámites académicos.
    
    Soporta todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
    
    Tipos de trámites soportados:
    - Pregrado Nacional
    - Pregrado Internacional
    - Posgrado Nacional
    - Posgrado Internacional
    
    Estados de trámites:
    - PENDIENTE: En espera de aprobación
    - APROBADO: Aprobado por gestor
    - RECHAZADO: Rechazado
    - COMPLETADO: Trámite finalizado
    """
    queryset = Tramite.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = TramiteSerializer
    
