from rest_framework import serializers
from plataforma.models.procedure import Tramite, Solicitante


class SolicitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitante
        fields = ('id', 'nombre', 'apellidos', 'ci', 'email', 'telefono')


class TramiteSerializer(serializers.ModelSerializer):
    solicitante = SolicitanteSerializer(read_only=True)

    class Meta:
        model = Tramite
        fields = ('id', 'nombre_tramite', 'usuario', 'solicitante', 'estado', 'observaciones', 'fecha_limite', 'numero_seguimiento', 'created_at', 'updated_at')


class TramiteDetailSerializer(TramiteSerializer):
    # Para incluir detalles específicos, se pueden añadir campos dinámicamente desde las apps
    class Meta(TramiteSerializer.Meta):
        pass
