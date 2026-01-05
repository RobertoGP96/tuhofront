from rest_framework import serializers
from ..models.department import Department
from ..models.area import Area

class DepartmentInAreaSerializer(serializers.ModelSerializer):
    """Serializer for department info in area views."""
    class Meta:
        model = Department
        fields = ['id', 'name']


class AreaListSerializer(serializers.ModelSerializer):
    """Serializer for area list view."""
    department = DepartmentInAreaSerializer(read_only=True)
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'department', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AreaSerializer(serializers.ModelSerializer):
    """Serializer for area create/update."""
    department_info = DepartmentInAreaSerializer(source='department', read_only=True)
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'department', 'department_info', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate that the name is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Area name cannot be empty.")
        return value.strip()
