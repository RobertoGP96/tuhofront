# serializers.py
from rest_framework import serializers
from ..models.area import Area
from ..models.department import Department


# ============== DEPARTMENT SERIALIZERS ==============

class AreaInDepartmentSerializer(serializers.ModelSerializer):
    """Serializer for areas within department detail."""
    class Meta:
        model = Area
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentListSerializer(serializers.ModelSerializer):
    """Serializer for department list view."""
    total_areas = serializers.ReadOnlyField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'total_areas', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentDetailSerializer(serializers.ModelSerializer):
    """Serializer for department detail view with areas."""
    areas = AreaInDepartmentSerializer(many=True, read_only=True)
    total_areas = serializers.ReadOnlyField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'total_areas', 'areas', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for department create/update."""
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate that the name is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Department name cannot be empty.")
        return value.strip()

