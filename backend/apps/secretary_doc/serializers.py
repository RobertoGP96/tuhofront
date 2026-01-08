from rest_framework import serializers
from .models import SecretaryDocProcedure, SeguimientoTramite, Documento
from apps.platform.serializers.user import UserBaseSerializer
from apps.platform.models.user import User


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'
        read_only_fields = ('fecha_subida',)


class SeguimientoTramiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeguimientoTramite
        fields = '__all__'
        read_only_fields = ('fecha',)


class SecretaryDocProcedureSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo SecretaryDocProcedure.
    Incluye los campos básicos del trámite.
    """
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'id', 'state', 'created_at', 'updated_at',
            'study_type', 'visibility_type', 'career', 'year',
            'academic_program', 'document_type', 'interest',
            'full_name', 'id_card', 'email', 'phone',
            'document_file', 'registry_volume', 'folio', 'number',
            'created_by', 'updated_by'
        ]
        read_only_fields = ('created_at', 'updated_at', 'state')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Agregar la URL del archivo si existe
        if instance.document_file:
            representation['document_file_url'] = instance.document_file.url
        return representation


class SecretaryDocProcedureCreateSerializer(serializers.ModelSerializer):
    """
    Serializador para la creación de trámites de secretaría docente.
    Incluye validación de campos requeridos.
    """
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'study_type', 'visibility_type', 'career', 'year',
            'academic_program', 'document_type', 'interest',
            'full_name', 'id_card', 'email', 'phone',
            'document_file', 'registry_volume', 'folio', 'number'
        ]

    def create(self, validated_data):
        # Obtener el usuario autenticado si existe
        user = None
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user

        # Crear el trámite
        tramite = SecretaryDocProcedure.objects.create(
            **validated_data,
            created_by=user,
            updated_by=user
        )
        return tramite


class SecretaryDocProcedureDetailSerializer(SecretaryDocProcedureSerializer):
    """
    Serializador detallado que incluye los seguimientos y documentos relacionados.
    """
    seguimientos = SeguimientoTramiteSerializer(many=True, read_only=True)
    documentos = DocumentoSerializer(many=True, read_only=True)
    
    class Meta(SecretaryDocProcedureSerializer.Meta):
        fields = SecretaryDocProcedureSerializer.Meta.fields + ['seguimientos', 'documentos']


# Alias para compatibilidad con código existente
TramiteSerializer = SecretaryDocProcedureSerializer
TramiteCreateSerializer = SecretaryDocProcedureCreateSerializer
TramiteDetailSerializer = SecretaryDocProcedureDetailSerializer

