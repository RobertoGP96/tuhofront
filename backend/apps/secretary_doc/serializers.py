from rest_framework import serializers
from .models import Tramite, TramiteSecretariaDocente
from apps.platform.serializers.user import UserSerializer
from apps.platform.models.procedure import Procedure


class TramiteSecretariaDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TramiteSecretariaDocente
        exclude = ('tramite',)


class TramiteCreateSerializer(serializers.Serializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=None, required=False, allow_null=True)
    solicitante = serializers.DictField(child=serializers.CharField(), required=False)
    nombre_tramite = serializers.CharField()
    fecha_limite = serializers.DateTimeField(required=False, allow_null=True)
    detalle = TramiteSecretariaDetalleSerializer()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Asignar el queryset en tiempo de inicialización para evitar import loops
        from apps.platform.models.user import User
        self.fields['usuario'].queryset = User.objects.all()

    def create(self, validated_data):
        Usuario = None
        usuario = validated_data.get('usuario', None)
        solicitante_data = validated_data.get('solicitante')

        if solicitante_data:
            solicitante = Solicitante.objects.create(
                nombre=solicitante_data.get('nombre'),
                apellidos=solicitante_data.get('apellidos'),
                ci=solicitante_data.get('ci'),
                email=solicitante_data.get('email'),
                telefono=solicitante_data.get('telefono'),
            )
        else:
            solicitante = None

        # Crear tramite central
        central = CentralTramite.objects.create(
            nombre_tramite=validated_data.get('nombre_tramite'),
            usuario=usuario,
            solicitante=solicitante,
            fecha_limite=validated_data.get('fecha_limite'),
        )

        # Crear detalle especifico
        detalle_data = validated_data.get('detalle')
        detalle = TramiteSecretariaDocente.objects.create(
            tramite=central,
            **detalle_data
        )

        return central

    def to_representation(self, instance):
        # Representación simple del tramite central con detalle
        detalle = None
        try:
            detalle = instance.secretaria_detalle
        except Exception:
            detalle = None

        return {
            'id': instance.id,
            'nombre_tramite': instance.nombre_tramite,
            'usuario': instance.usuario.pk if instance.usuario else None,
            'solicitante': str(instance.solicitante) if instance.solicitante else None,
            'estado': instance.estado.nombre if instance.estado else None,
            'numero_seguimiento': instance.numero_seguimiento,
            'detalle': TramiteSecretariaDetalleSerializer(detalle).data if detalle else None,
        }

