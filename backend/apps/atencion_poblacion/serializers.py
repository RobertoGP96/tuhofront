from rest_framework import serializers
from .models import AtencionPoblacion

class AtencionPoblacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtencionPoblacion
        exclude = ['on_create','on_modified']