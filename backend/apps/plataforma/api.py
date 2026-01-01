from .models.models import Noticias
from rest_framework import viewsets, permissions
from .serializers import NoticiaSerializer

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticias.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = NoticiaSerializer
    