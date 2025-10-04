from rest_framework import serializers
from .models import Noticias, Email, TramiteGeneral, EstadosTramites


class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticias
        fields = '__all__'
        read_only_fields = ('on_create', 'on_modified')


class EmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Email
        fields = '__all__'
        extra_kwargs = {
            'smtp_password': {'write_only': True}
        }


class TramiteGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = TramiteGeneral
        fields = '__all__'
        read_only_fields = ('on_create', 'on_modified')


class EstadosTramitesSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosTramites
        fields = '__all__'
        