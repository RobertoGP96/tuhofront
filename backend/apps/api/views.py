from rest_framework import viewsets

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import generics

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import Group

from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

import uuid

# Imports de permisos personalizados
from .permissions import IsOwnerOrReadOnly, IsOwnerOrStaff, IsStaffOrReadOnly, IsAdminOrReadOnly

# Imports de modelos y serializers
from .models import Area
from atencion_poblacion.models import AtencionPoblacion
from notificaciones.models import Notificacion
from notificaciones.models import Usuario
from plataforma.models import Noticias, Email, EstadosTramites
from secretaria_docente.models import Tramite
from internal_procedures.models import (
    Guest, FeedingDays, Department, Area as InternalArea, Note,
    FeedingProcedure, AccommodationProcedure, TransportProcedure, 
    TransportProcedureType, MaintanceProcedure, MaintanceProcedureType, 
    MaintancePriority
)

# Imports de serializers
from usuarios.serializers import UsuarioSerializer
from notificaciones.serializers import NotificacionSerializer
from atencion_poblacion.serializers import AtencionPoblacionSerializer
from plataforma.serializers import NoticiaSerializer, EmailSerializer, EstadosTramitesSerializer
from secretaria_docente.serializers import TramiteSerializer
from internal_procedures.serializers import (
    GuestSerializer, FeedingDaysSerializer, DepartmentSerializer, 
    AreaSerializer as InternalAreaSerializer, NoteSerializer,
    FeedingProcedureSerializer, AccommodationProcedureSerializer,
    TransportProcedureSerializer, TransportProcedureTypeSerializer,
    MaintanceProcedureSerializer, MaintanceProcedureTypeSerializer,
    MaintancePrioritySerializer
)
from .serializers import AreaSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]  # Solo administradores pueden gestionar usuarios


class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [IsStaffOrReadOnly]  # Staff puede crear, todos pueden leer


class AtencionPoblacionViewSet(viewsets.ModelViewSet):
    queryset = AtencionPoblacion.objects.all()
    serializer_class = AtencionPoblacionSerializer
    permission_classes = [IsOwnerOrStaff]  # Usuarios ven solo los suyos, staff ve todos


# ViewSets para Plataforma
class NoticiasViewSet(viewsets.ModelViewSet):
    queryset = Noticias.objects.all()
    serializer_class = NoticiaSerializer
    permission_classes = [IsStaffOrReadOnly]  # Todos pueden leer, solo staff puede escribir
    
    def get_queryset(self):
        queryset = Noticias.objects.all().order_by('-on_create')
        return queryset


class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    permission_classes = [IsAdminUser]  # Solo administradores


class EstadosTramitesViewSet(viewsets.ModelViewSet):
    queryset = EstadosTramites.objects.all()
    serializer_class = EstadosTramitesSerializer
    permission_classes = [IsStaffOrReadOnly]  # Solo staff puede modificar estados


# ViewSets para Secretaría Docente
class TramiteViewSet(viewsets.ModelViewSet):
    queryset = Tramite.objects.all()
    serializer_class = TramiteSerializer
    permission_classes = [IsOwnerOrStaff]  # Usuarios ven solo los suyos
    
    def get_queryset(self):
        queryset = Tramite.objects.all()
        if not self.request.user.is_staff:
            # Los usuarios normales solo ven sus propios trámites
            queryset = queryset.filter(usuario=self.request.user)
        return queryset.order_by('-fecha')
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


# ViewSets para Internal Procedures
class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated]


class FeedingDaysViewSet(viewsets.ModelViewSet):
    queryset = FeedingDays.objects.all()
    serializer_class = FeedingDaysSerializer
    permission_classes = [IsAuthenticated]


class InternalDepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsStaffOrReadOnly]


class InternalAreaViewSet(viewsets.ModelViewSet):
    queryset = InternalArea.objects.all()
    serializer_class = InternalAreaSerializer
    permission_classes = [IsStaffOrReadOnly]


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsStaffOrReadOnly]  # Solo staff puede crear notas


class FeedingProcedureViewSet(viewsets.ModelViewSet):
    queryset = FeedingProcedure.objects.all()
    serializer_class = FeedingProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = FeedingProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccommodationProcedureViewSet(viewsets.ModelViewSet):
    queryset = AccommodationProcedure.objects.all()
    serializer_class = AccommodationProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = AccommodationProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransportProcedureTypeViewSet(viewsets.ModelViewSet):
    queryset = TransportProcedureType.objects.all()
    serializer_class = TransportProcedureTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


class TransportProcedureViewSet(viewsets.ModelViewSet):
    queryset = TransportProcedure.objects.all()
    serializer_class = TransportProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = TransportProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MaintanceProcedureTypeViewSet(viewsets.ModelViewSet):
    queryset = MaintanceProcedureType.objects.all()
    serializer_class = MaintanceProcedureTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


class MaintancePriorityViewSet(viewsets.ModelViewSet):
    queryset = MaintancePriority.objects.all()
    serializer_class = MaintancePrioritySerializer
    permission_classes = [IsStaffOrReadOnly]


class MaintanceProcedureViewSet(viewsets.ModelViewSet):
    queryset = MaintanceProcedure.objects.all()
    serializer_class = MaintanceProcedureSerializer
    permission_classes = [IsOwnerOrStaff]
    
    def get_queryset(self):
        queryset = MaintanceProcedure.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-on_create')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class Login(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"message": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_auth = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({"response": "incorrecto", "message": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user_to_auth.username, password=password)
        if user is not None:
            if not user.is_active:
                return Response({"response": "incorrecto", "message": "Account is not activated"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            usuario = Usuario.objects.get(id=user.id)
            user_info = {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
                "first_name": usuario.first_name,
                "last_name": usuario.last_name,
                "groups": [group.name for group in usuario.groups.all()],
            }
            
            return Response({
                "user": user_info,
                "access": str(access_token),
                "refresh": str(refresh),
                "message": "Login successful"
            }, status=status.HTTP_200_OK)
        else:
            return Response({"response": "incorrecto", "message": "Account information is incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        
class Logout(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
        

class Register(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if Usuario.objects.filter(username=username).exists():
            return Response({"message": "Ya existe una cuenta con ese usuario."}, status=status.HTTP_400_BAD_REQUEST)

        if Usuario.objects.filter(email=email).exists():
            return Response({"message": "Ya existe una cuenta con ese email."}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"message": "Las contraseñas deben coincidir."}, status=status.HTTP_400_BAD_REQUEST)

        usuario = Usuario(
            username=username, 
            email=email, 
            first_name=first_name,
            last_name=last_name,
            token_activacion=str(uuid.uuid4()), 
            is_active=False
        )
        usuario.set_password(password1)

        try:
            usuario.save()
            default_group, created = Group.objects.get_or_create(name="Usuario")
            usuario.groups.add(default_group)

            # Enviar correo de verificación
            subject = "Verificación de cuenta"
            message = f'Hola, acceda a este enlace para validar su cuenta: {settings.DOMAIN}/api/verify/{usuario.token_activacion}/'
            recipient_list = [usuario.email]
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)

            return Response({"message": "Su cuenta ha sido creada con éxito, verifique su email para validar su cuenta."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": "Algo salió mal realizando el registro, por favor intente de nuevo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class TokenValidationView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        try:
            profile_obj = Usuario.objects.filter(token_activacion=token).first()
            if profile_obj:
                if profile_obj.is_active:
                    return Response({"message": "Su cuenta ya está verificada."}, status=status.HTTP_200_OK)
                profile_obj.is_active = True
                profile_obj.save()
                return Response({"message": "Su cuenta ha sido verificada."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No existe una cuenta con ese token o la verificación ha expirado."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": "Ha ocurrido un error, por favor intente de nuevo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        email = request.data.get('email')
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            # Generar token y enviar correo
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Enviar correo con el enlace para restablecer la contraseña
            subject = "Restablecimiento de contraseña"
            message = f'Acceda a este enlace para restablecer su contraseña: {settings.DOMAIN}/api/reset/{uid}/{token}/'
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            return Response({"message": "Se ha enviado un correo para restablecer la contraseña."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "No existe una cuenta con ese email."}, status=status.HTTP_400_BAD_REQUEST)

                            


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_info = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "groups": [group.name for group in user.groups.all()],
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        return Response({"user": user_info}, status=status.HTTP_200_OK)


class AreaCreateView(generics.ListCreateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAdminUser] 