from rest_framework import serializers
from ..models.procedure import Procedure


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ('id', 'user', 'state', 'observation', 'deadline', 'created_at', 'updated_at')


class ProcedureDetailSerializer(ProcedureSerializer):
    # Para incluir detalles específicos, se pueden añadir campos dinámicamente desde las apps
    class Meta(ProcedureSerializer.Meta):
        pass

