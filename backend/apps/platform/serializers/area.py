from rest_framework import serializers
from ..models.department import Department
from ..models.area import Area

class DepartmentInAreaSerializer(serializers.ModelSerializer):
    """Serializer for department info in area views."""
    class Meta:
        model = Department
        fields = ['id', 'name']


class AreaListSerializer(serializers.ModelSerializer):
    """Serializer for area list view.

    Expone `department` como ID (FK) y `department_name` como string para el frontend.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Area
        fields = ['id', 'name', 'department', 'department_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AreaSerializer(serializers.ModelSerializer):
    """Serializer for area create/update.

    Mantiene `department` como FK (escritura/lectura), expone `department_name` y
    `department_info` para que cualquier consumidor obtenga lo que necesite.
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_info = DepartmentInAreaSerializer(source='department', read_only=True)

    class Meta:
        model = Area
        fields = ['id', 'name', 'department', 'department_name', 'department_info', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate that the name is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Area name cannot be empty.")
        return value.strip()
