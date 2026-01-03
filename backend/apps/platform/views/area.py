from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from models.department import Department
from serializers import AreaListSerializer
from models.area import Area

class AreaViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage areas.
    
    Available endpoints:
    - GET /api/areas/ - List all areas
    - POST /api/areas/ - Create new area
    - GET /api/areas/{id}/ - Get specific area
    - PUT /api/areas/{id}/ - Update entire area
    - PATCH /api/areas/{id}/ - Partially update area
    - DELETE /api/areas/{id}/ - Delete area
    - GET /api/areas/by_department/{department_id}/ - List areas by department
    """
    queryset = Area.objects.select_related('department').all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AreaListSerializer
        return AreaListSerializer
    
    def list(self, request, *args, **kwargs):
        """List all areas with their department info."""
        queryset = self.get_queryset()
        
        # Filter by department if provided
        department_id = request.query_params.get('department_id')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new area."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return with department info
        response_serializer = AreaListSerializer(serializer.instance)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete an area."""
        instance = self.get_object()
        name = instance.name
        department_name = instance.department.name
        self.perform_destroy(instance)
        return Response(
            {
                'message': f'Area "{name}" from department "{department_name}" deleted successfully.'
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='by_department/(?P<department_id>[^/.]+)')
    def by_department(self, request, department_id=None):
        """Get all areas for a specific department."""
        try:
            department = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            return Response(
                {'error': 'Department not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        areas = self.get_queryset().filter(department=department)
        serializer = AreaListSerializer(areas, many=True)
        
        return Response({
            'department': {
                'id': department.id,
                'name': department.name
            },
            'count': areas.count(),
            'areas': serializer.data
        })