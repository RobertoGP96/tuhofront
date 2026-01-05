from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models.department import Department
from ..serializers import (
    DepartmentSerializer, DepartmentListSerializer, DepartmentDetailSerializer,
    AreaSerializer, AreaListSerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage departments.
    
    Available endpoints:
    - GET /api/departments/ - List all departments
    - POST /api/departments/ - Create new department
    - GET /api/departments/{id}/ - Get specific department with its areas
    - PUT /api/departments/{id}/ - Update entire department
    - PATCH /api/departments/{id}/ - Partially update department
    - DELETE /api/departments/{id}/ - Delete department
    """
    queryset = Department.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DepartmentListSerializer
        elif self.action == 'retrieve':
            return DepartmentDetailSerializer
        return DepartmentSerializer
    
    def list(self, request, *args, **kwargs):
        """List all departments."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Get department detail with all its areas."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new department."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a department and all its areas."""
        instance = self.get_object()
        name = instance.name
        areas_count = instance.total_areas
        self.perform_destroy(instance)
        return Response(
            {
                'message': f'Department "{name}" and {areas_count} area(s) deleted successfully.'
            },
            status=status.HTTP_200_OK
        )