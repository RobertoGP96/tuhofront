from .models import Tramite
from rest_framework import viewsets, permissions
from .serializers import TramiteSerializer

class TramiteViewSet(viewsets.ModelViewSet):
    queryset = Tramite.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = TramiteSerializer
    
