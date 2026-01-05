from .models import Noticias
from rest_framework import viewsets, permissions
from .serializers import NoticiaSerializer

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticias.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = NoticiaSerializer


from .serializers.procedure import ProcedureSerializer, ProcedureDetailSerializer
from .models.procedure import Procedure


class TramiteViewSet(viewsets.ModelViewSet):
    queryset = CentralTramite.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TramiteSerializer
    