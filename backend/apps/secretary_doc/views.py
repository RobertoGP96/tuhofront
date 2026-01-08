from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.generic import DetailView
from datetime import datetime, timedelta
import json

# Local imports
from apps.platform.models.procedure import ProcedureStateEnum
from apps.secretary_doc.models import Tramite
from .models import SecretaryDocProcedure, SeguimientoTramite, Documento
from .serializers import (
    SecretaryDocProcedureSerializer,
    SecretaryDocProcedureCreateSerializer,
    SecretaryDocProcedureDetailSerializer,
    SeguimientoTramiteSerializer,
    DocumentoSerializer
)
from .decorators import administracion_required, gestores_tramites_required, all_required
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly

# Get the user model
User = get_user_model()
Usuario = User  # For backward compatibility

class TramiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y editar los trámites.
    """
    queryset = SecretaryDocProcedure.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return SecretaryDocProcedureCreateSerializer
        elif self.action == 'retrieve':
            return SecretaryDocProcedureDetailSerializer
        return SecretaryDocProcedureSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        tramite = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if not nuevo_estado:
            return Response(
                {'error': 'El campo estado es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tramite.state = nuevo_estado
        tramite.updated_by = request.user
        tramite.save()
        
        # Crear un nuevo seguimiento
        SeguimientoTramite.objects.create(
            tramite=tramite,
            estado=nuevo_estado,
            observaciones=f'Estado cambiado a {nuevo_estado}',
            usuario=request.user
        )
        
        return Response({'status': 'Estado actualizado'})

    @action(detail=True, methods=['post'])
    def subir_documento(self, request, pk=None):
        tramite = self.get_object()
        archivo = request.FILES.get('archivo')
        
        if not archivo:
            return Response(
                {'error': 'No se ha proporcionado ningún archivo'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        documento = Documento.objects.create(
            tramite=tramite,
            nombre=archivo.name,
            archivo=archivo,
            subido_por=request.user
        )
        
        return Response(
            {'documento_id': documento.id, 'url': documento.archivo.url},
            status=status.HTTP_201_CREATED
        )


class EstadisticasView(APIView):
    """
    Vista para obtener estadísticas de trámites.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, format=None):
        # Conteo total de trámites
        total_tramites = SecretaryDocProcedure.objects.count()
        
        # Conteo por estado
        por_estado = (
            SecretaryDocProcedure.objects
            .values('state')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        
        # Conteo por tipo de estudio
        por_tipo_estudio = (
            SecretaryDocProcedure.objects
            .values('study_type')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        
        # Trámites de los últimos 30 días
        fecha_limite = timezone.now() - timedelta(days=30)
        tramites_recientes = (
            SecretaryDocProcedure.objects
            .filter(created_at__gte=fecha_limite)
            .count()
        )
        
        return Response({
            'total_tramites': total_tramites,
            'por_estado': list(por_estado),
            'por_tipo_estudio': list(por_tipo_estudio),
            'tramites_ultimos_30_dias': tramites_recientes
        })


class SeguimientoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar los seguimientos de los trámites.
    """
    serializer_class = SeguimientoTramiteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo los seguimientos de trámites que el usuario puede ver
        return SeguimientoTramite.objects.filter(
            Q(tramite__created_by=self.request.user) | 
            Q(usuario=self.request.user)
        ).order_by('-fecha')
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class DocumentoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar los documentos de los trámites.
    """
    serializer_class = DocumentoSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        # Solo los documentos de trámites que el usuario puede ver
        return Documento.objects.filter(
            Q(tramite__created_by=self.request.user) | 
            Q(subido_por=self.request.user)
        ).order_by('-fecha_subida')
    
    def perform_create(self, serializer):
        serializer.save(subido_por=self.request.user)


# Vistas para compatibilidad con el frontend existente
class MainView(APIView):
    """
    Vista para la página principal con estadísticas básicas.
    """
    def get(self, request, format=None):
        usuarios_count = User.objects.count()
        cantidad_tramites = SecretaryDocProcedure.objects.count()
        completados = SecretaryDocProcedure.objects.filter(state='Completado').count()
        
        posgrado_nacional = Tramite.objects.filter(tipo_est='Posgrado', uso='Nacional')
        posgrado_internacional = Tramite.objects.filter(tipo_est='Posgrado', uso_i='Internacional')
        pregrado_nacional = Tramite.objects.filter(tipo_est='Pregrado', uso='Nacional')
        pregrado_internacional = Tramite.objects.filter(tipo_est='Pregrado', uso_i='Internacional')
        
        pregrado_nacional_count = pregrado_nacional.count()
        pregrado_internacional_count = pregrado_internacional.count()
        posgrado_nacional_count = posgrado_nacional.count()
        posgrado_internacional_count = posgrado_internacional.count()
        
        data_grafica = [
            {'categoria': 'Pregrado Nacional', 'cantidad': pregrado_nacional_count},
            {'categoria': 'Pregrado Internacional', 'cantidad': pregrado_internacional_count},
            {'categoria': 'Posgrado Nacional', 'cantidad': posgrado_nacional_count},
            {'categoria': 'Posgrado Internacional', 'cantidad': posgrado_internacional_count}
        ]
        data_json = json.dumps(data_grafica)
        
        estados_tramites = Tramite.objects.values('estado').annotate(frecuencia=Count('estado'))
        estados_validos = ProcedureStateEnum.values
        estados_filtrados = {estado['estado']: estado['frecuencia'] for estado in estados_tramites if estado['estado'] in estados_validos}
        data_grafica_estados = [{'nombre': estado, 'valor': frecuencia} for estado, frecuencia in estados_filtrados.items()]
        data_json_estados = json.dumps(data_grafica_estados)
        
        completados = Tramite.objects.filter(estado='Completado').count()
        espera = Tramite.objects.filter(estado='En Espera').count()
        
        context = {
            'tramite_t': tramite_t,
            'cantidad_tramites': cantidad_tramites,
            'usuarios_count': usuarios_count,
            'completado': completados,
            'espera': espera,
            'data_grafica': data_json,
            'data_grafica_estados': data_json_estados,
        }
        
        # Devolver datos JSON
        return JsonResponse({'success': True, 'context': context})

@login_required
@administracion_required
def Cambiar_Estado(request, id):
    tramite = Tramite.objects.get(id=id)
    if request.method == 'POST':
        try:
            tramite.estado = request.POST.get("role")
            enviar_correo_cambio_estado(tramite)
            tramite.save()
            return JsonResponse({'success': True, 'message': 'Estado cambiado', 'id': tramite.id, 'estado': tramite.estado})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error cambiando estado'}, status=500)
    estados = ProcedureStateEnum.values
    return JsonResponse({'success': True, 'estados': estados})

@login_required
@gestores_tramites_required
def Cambiar_Estado_Posgrado(request, id):
    tramite = Tramite.objects.get(id=id)
    if request.method == 'POST':
        try:
            tramite.estado = request.POST.get("role")
            enviar_correo_cambio_estado(tramite)
            tramite.save()
            return JsonResponse({'success': True, 'message': 'Estado cambiado posgrado', 'id': tramite.id})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error cambiando estado'}, status=500)
    estados = ProcedureStateEnum.values
    return JsonResponse({'success': True, 'estados': estados})


@login_required
@gestores_tramites_required
def Cambiar_Estado_Pregrado(request, id):
    tramite = Tramite.objects.get(id=id)
    if request.method == 'POST':
        try:
            tramite.estado = request.POST.get("role")
            enviar_correo_cambio_estado(tramite)
            tramite.save()
            return JsonResponse({'success': True, 'message': 'Estado cambiado pregrado', 'id': tramite.id})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error cambiando estado'}, status=500)
    estados = ProcedureStateEnum.values
    return JsonResponse({'success': True, 'estados': estados})

@login_required
@gestores_tramites_required
def Tramites_Tipo_Pregrado(request):
    tramites_pregrado = list(Tramite.objects.filter(tipo_estudio='Pregrado').values())
    return JsonResponse({'success': True, 'tramites_pregrado': tramites_pregrado})

@login_required
@gestores_tramites_required
def Tramites_Delete_Tramites_Tipo_Pregrado(request,id):
    tramite = Tramite.objects.get(id=id)
    tramite.delete()

    return JsonResponse({'success': True, 'message': 'Trámite eliminado', 'id': id})

@method_decorator([login_required, gestores_tramites_required ], name='dispatch')
class Tramites_Detail_Pregrado(DetailView):
    model = Tramite
    def get(self, request, *args, **kwargs):
        tramite = self.get_object()
        data = model_to_dict(tramite)
        flags = {
            'Pregrado_Nacional': bool(tramite.tipo_pren and tramite.tipo_pren.strip()),
            'Pregrado_Nacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso.strip()),
            'Pregrado_Internacional': bool(tramite.tipo_prei and tramite.tipo_prei.strip()),
            'Pregrado_Internacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso_i.strip()),
            'Posgrado_Nacional': bool(tramite.tipo_posn and tramite.tipo_posn.strip()),
            'Posgrado_Nacional_Legalizacion': bool(tramite.tipo_est and tramite.uso and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso.strip()),
            'Posgrado_Internacional': bool(tramite.tipo_posi and tramite.tipo_posi.strip()),
            'Posgrado_Internacional_Legalizacion': bool(tramite.tipo_est and tramite.uso_i and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso_i.strip()),
        }
        return JsonResponse({'success': True, 'tramite': data, 'flags': flags})




@login_required
@gestores_tramites_required
def Tramites_Tipo_Posgrado(request):
    tramites_posgrado = Tramite.objects.filter(tipo_est='Posgrado')    
    context ={'tramites_posgrado': tramites_posgrado,}
    return render(request, 'General/tramite_tipo_posgrado.html', context)

@login_required
@gestores_tramites_required
def Tramites_Delete_Tramites_Tipo_Posgrado(request,id):
    tramite = Tramite.objects.get(id=id)
    tramite.delete()
    return redirect("Tramites_Tipo_Posgrado")

@method_decorator([login_required, gestores_tramites_required ], name='dispatch')
class Tramites_Detail_Posgrado(DetailView):
    model = Tramite
    def get(self, request, *args, **kwargs):
        tramite = self.get_object()
        data = model_to_dict(tramite)
        flags = {
            'Pregrado_Nacional': bool(tramite.tipo_pren and tramite.tipo_pren.strip()),
            'Pregrado_Nacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso.strip()),
            'Pregrado_Internacional': bool(tramite.tipo_prei and tramite.tipo_prei.strip()),
            'Pregrado_Internacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso_i.strip()),
            'Posgrado_Nacional': bool(tramite.tipo_posn and tramite.tipo_posn.strip()),
            'Posgrado_Nacional_Legalizacion': bool(tramite.tipo_est and tramite.uso and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso.strip()),
            'Posgrado_Internacional': bool(tramite.tipo_posi and tramite.tipo_posi.strip()),
            'Posgrado_Internacional_Legalizacion': bool(tramite.tipo_est and tramite.uso_i and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso_i.strip()),
        }
        return JsonResponse({'success': True, 'tramite': data, 'flags': flags})

@method_decorator([login_required, gestores_tramites_required ], name='dispatch')
class Tramites_Detail_Admin(DetailView):
    model = Tramite
    def get(self, request, *args, **kwargs):
        tramite = self.get_object()
        data = model_to_dict(tramite)
        flags = {
            'Pregrado_Nacional': bool(tramite.tipo_pren and tramite.tipo_pren.strip()),
            'Pregrado_Nacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso.strip()),
            'Pregrado_Internacional': bool(tramite.tipo_prei and tramite.tipo_prei.strip()),
            'Pregrado_Internacional_Legalizacion': bool(tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion and tramite.tipo_estudio.strip() and tramite.uso_i.strip()),
            'Posgrado_Nacional': bool(tramite.tipo_posn and tramite.tipo_posn.strip()),
            'Posgrado_Nacional_Legalizacion': bool(tramite.tipo_est and tramite.uso and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso.strip()),
            'Posgrado_Internacional': bool(tramite.tipo_posi and tramite.tipo_posi.strip()),
            'Posgrado_Internacional_Legalizacion': bool(tramite.tipo_est and tramite.uso_i and tramite.legalizacion and tramite.tipo_est.strip() and tramite.uso_i.strip()),
        }
        return JsonResponse({'success': True, 'tramite': data, 'flags': flags})
    
@login_required
@administracion_required
def Informacion_Usuario(request,id):
    usuario = Usuario.objects.get(id=id)
    if request.POST:
        usuario.first_name = request.POST.get('first_name', usuario.first_name)
        usuario.last_name = request.POST.get('last_name', usuario.last_name)
        usuario.id_card = request.POST.get('id_card', request.POST.get('carnet', getattr(usuario, 'id_card', None)))
        usuario.email = request.POST.get('email', usuario.email)
        usuario.phone = request.POST.get('phone', request.POST.get('telefono', getattr(usuario, 'phone', None)))
        usuario.save()
        return redirect("Usuarios")
    return render(request,"General/informacion_usuario.html",{"usuario":usuario})




