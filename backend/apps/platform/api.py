from .models import Noticias
from rest_framework import viewsets, permissions
from .serializers import NoticiaSerializer

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticias.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = NoticiaSerializer


from plataforma.serializers.procedure import TramiteSerializer, TramiteDetailSerializer
from plataforma.models.procedure import Tramite as CentralTramite


class TramiteViewSet(viewsets.ModelViewSet):
    queryset = CentralTramite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TramiteSerializer
    