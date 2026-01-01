from .models import AtencionPoblacion
from rest_framework import viewsets, permissions
from .serializers import AtencionPoblacionSerializer

class AtencionPoblacionViewSet(viewsets.ModelViewSet):
    queryset = AtencionPoblacion.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AtencionPoblacionSerializer