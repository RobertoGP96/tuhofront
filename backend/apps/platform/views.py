from django.conf import settings
from django.utils.decorators import method_decorator
from django.shortcuts import redirect, render, HttpResponse
from django.contrib.auth.decorators import login_required, permission_required
from django.core.mail import send_mail
from usuarios.models import Usuario
from usuarios.forms import InformacionPersonalForm
from atencion_poblacion.models import AtencionPoblacion
from atencion_poblacion.forms import CambiarEstadoForm, CambiarEstadoClaudiaForm
from .forms import CrearNoticiasForm, EmailForm
from .models.models import Noticias, Email, TramiteGeneral
from django.contrib.auth.models import Group, Permission
from django.db.models import Count
from django.http import HttpRequest, HttpResponseRedirect
from .decorators import admin_required, pure_admin_required
from django.core.paginator import Paginator
from django.db.models import Q
from atencion_poblacion.choices import estado_choice
from notificaciones.models import Notificacion
from datetime import datetime
from secretaria_docente.models import Tramite
from django.views.generic import (
    DetailView,
    )


def estado(tramite) -> int:
    match tramite.estado:
        case "Completado":
            return 1
        case "En espera":
            return 2
        case "Aceptado":
            return 3
        case "Procesando":
            return 4
        case "Listo para recoger":
            return 5
        case "Entregado":
            return 6
        case _:
            return -1

def count_tramites_by_month():
    data = {
        "1":0,
        "2":0,
        "3":0,
        "4":0,
        "5":0,
        "6":0,
        "7":0,
        "8":0,
        "9":0,
        "10":0,
        "11":0,
        "12":0,
    }
    for i in data.keys():
        tramites_by_month = TramiteGeneral.objects.filter(
            created_at__month=int(i), 
        ).count()
        data[i] = tramites_by_month
    return data

# Create your views here.

# Inicio
def Inicio(request):
    return render(request,"plataforma/Inicio.html")

def SolicitudTramite(request):
    query = []
    if request.POST:
        query = []
        consulta_gral = TramiteGeneral.objects.select_subclasses()
        for q in consulta_gral:
            if str(q.numero_seguimiento) == request.POST['token']:
                query.append(q)
    
    context = {
        'Tramites': query,
    }
    return render(request,"plataforma/Solicitud de Tramites.html",context)

# Mis Tramites
@login_required
def MisTramites(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    query = TramiteGeneral.objects.select_subclasses().filter(
            Q(atencionpoblacion__usuario=usuario) | Q(tramite__usuario=usuario))
    
    if request.POST:
        query = []
        consulta_gral = TramiteGeneral.objects.select_subclasses()
        for q in consulta_gral:
            if str(q.numero_seguimiento) == request.POST['token']:
                query.append(q)
    
    context = {
        'Tramites': query,
    }
    # Para filtrar por otro modelo seria asi | Q(empleado__usuario=usuario) | Q(cliente__usuario=usuario)
    return render(request, "plataforma/Mis Trámites.html", context)

@login_required
def VisualizarTramiteUsuario(request,id):
    aPoblacion = AtencionPoblacion.objects.get(id=id)
    context = {
        "form":aPoblacion
    }
    return render(request,'AtencionPoblacion/Visualizar Atención a la Poblacion Usuario.html',context)

def VisualizarTramiteUsuarioAnonimo(request,id):
    aPoblacion = AtencionPoblacion.objects.get(id=id)
    context = {
        "form":aPoblacion
    }
    return render(request,'AtencionPoblacion/Visualizar Atención a la Poblacion Usuario Anonimo.html',context)

# Información Personal
@login_required
def InformacionPersonal(request):
    return render (request,"plataforma/Informacion Personal.html")

# Administración
@login_required
@admin_required
def Administracion(request:HttpRequest):
    tramites_count = TramiteGeneral.objects.all().count()
    usuarios_count =  Usuario.objects.all().count()
    #completado = TramiteGeneral.objects.select_subclasses().filter(Q(atencionpoblacion__estado ="Completado")).count()
    lista_tramites = TramiteGeneral.objects.select_subclasses()
    estado_tramite = {
        "En_espera": 0,
        "Aceptado": 0,
        "Procesando": 0,
        "Listo_para_recoger": 0,
        "Entregado": 0,
        "Completado": 0,
    }
    for e in lista_tramites:
        estado_e = estado(e)
        match estado_e:
            case 1:
                estado_tramite["Completado"] += 1
            case 2:
                estado_tramite["En_espera"] += 1
            case 3:
                estado_tramite["Aceptado"] += 1
            case 4:
                estado_tramite["Procesando"] += 1
            case 5:
                estado_tramite["Listo_para_recoger"] += 1
            case 6:
                estado_tramite["Entregado"] += 1
            case _:
                pass
    #en_espera = TramiteGeneral.objects.select_subclasses().filter(Q(atencionpoblacion__estado ="En espera")).count()
     # Para filtrar por otro modelo seria asi | Q(empleado__usuario=usuario) | Q(cliente__usuario=usuario)
    context = {
        'usuarios': Usuario.objects.all(),
        'Tramites': TramiteGeneral.objects.select_subclasses(),
        'tramites_count':tramites_count,
        'usuarios_count':usuarios_count,
        'completado': estado_tramite["Completado"],
        'en_espera': estado_tramite["En_espera"],
        'tramites_by_state': estado_tramite,
        'tramites_by_month': count_tramites_by_month()
    }    
    if request.user.groups.filter(name='Administración').exists():
        return render (request,"plataforma/Sitio Administrativo.html", context)
    elif request.user.groups.filter(name='Administrador Trámites').exists():
        return render (request,"plataforma/Sitio Administrativo.html", context)
    return render (request,"plataforma/Sitio Administrativo.html", context)

# Trámites
@login_required
@admin_required
def Tramites(request):
    query = TramiteGeneral.objects.select_subclasses()
    if request.POST:
        query = []
        consulta_gral = TramiteGeneral.objects.select_subclasses()
        for q in consulta_gral:
            if str(q.numero_seguimiento) == request.POST['token']:
                query.append(q)
    context = {
        'Tramites': query,     
    }

    return render (request,"plataforma/Tramites.html",context)

@login_required
@admin_required
def CambiarEstado(request,tipo_tramite,id):
    tramite = TramiteGeneral.objects.select_subclasses().filter(nombre_tramite=tipo_tramite, pk=id)[0]
    if request.POST:
        usuario = tramite.usuario
        
        tramite.estado = request.POST["role"]
        tramite.save()
        if usuario:
            Notificacion(
                tipo="Info",
                asunto="Cambio de Estado",
                cuerpo=f"El trámite con Ticket: {tramite.token} ha cambiado su estado a {tramite.estado}",
                para=usuario,
                creado=datetime.now()
                ).save()
        return redirect("TramitesAdmin")
    if tramite.nombre_tramite == "Secretaría Docente":
        form = CambiarEstadoClaudiaForm(instance=tramite)
    else:
        form = CambiarEstadoForm(instance=tramite)
    estados = [e[0] for e in estado_choice]
    return render(request,"plataforma/Cambiar Estado.html",{"form":form, "estados":estados})

@login_required
@admin_required
def EliminarTramite(request,tipo_tramite,id):
    tramite = TramiteGeneral.objects.select_subclasses().filter(nombre_tramite=tipo_tramite, pk=id)
    tramite[0].delete()
    return redirect("TramitesAdmin")

@login_required
def EliminarTramiteUsuario(request,tipo_tramite,id):
    tramite = TramiteGeneral.objects.select_subclasses().filter(nombre_tramite=tipo_tramite, pk=id)
    tramite[0].delete()
    return redirect("MisTramites")

def EliminarTramiteUsuarioAnonimo(request,tipo_tramite,id):
    tramite = TramiteGeneral.objects.select_subclasses().filter(nombre_tramite=tipo_tramite, pk=id)
    tramite[0].delete()
    return redirect("SolicitudTramite")


# Usuarios
@login_required
@pure_admin_required
def Usuarios(request):
    context = {
        'usuarios': Usuario.objects.all()
    }
    return render (request,"plataforma/Usuarios.html", context)

@login_required
@pure_admin_required
def InformacionUsuario(request,id):
    usuario = Usuario.objects.get(id=id)
    if request.POST:
        usuario.first_name = request.POST.get('first_name', usuario.first_name)
        usuario.last_name = request.POST.get('last_name', usuario.last_name)
        usuario.id_card = request.POST.get('id_card', request.POST.get('carnet', getattr(usuario, 'id_card', None)))
        usuario.email = request.POST.get('email', usuario.email)
        usuario.phone = request.POST.get('phone', request.POST.get('telefono', getattr(usuario, 'phone', None)))
        usuario.address = request.POST.get('address', request.POST.get('direccion', getattr(usuario, 'address', None)))
        usuario.save()
        return redirect("Usuarios")
    form = InformacionPersonalForm(instance=usuario)
    return render(request,"plataforma/Informacion Usuario.html",{"form":form})

# Eliminar Usuarios
@login_required
@pure_admin_required
def EliminarUsuario(request,id):
    usuario = Usuario.objects.get(id=id)
    usuario.delete()
    return redirect("Usuarios")

# Cambiar Rol de Usuarios
@login_required
@pure_admin_required
def CambiarRol(request, id):
    if request.method == 'POST':
        try:
            usuario = Usuario.objects.get(id=id)
        except Usuario.DoesNotExist:
            return render (request,"plataforma/Atención a la Poblacion.html",{'response':'incorrecto', 'message':'Usuario no encontrado'})

        group_names = list(Group.objects.all().values_list('name', flat=True)) 
        selected_group = request.POST['role']

        if selected_group in group_names:
            try:
                group = Group.objects.get(name=selected_group)
            except Group.DoesNotExist:
                return render (request,"plataforma/Atención a la Poblacion.html",{'response':'incorrecto', 'message':'Grupo no encontrado'})

            usuario.groups.clear()
            usuario.groups.add(group)
            return redirect('Usuarios')
        else:
           return render (request,"plataforma/Atención a la Poblacion.html",{'response':'incorrecto', 'message':'Rol inválido'})
    else:
        group_names = list(Group.objects.all().values_list('name', flat=True))
        return render(request, "plataforma/Cambiar Rol.html", {'group_names': group_names})

        
# Noticas del usuario
def NoticiasUsuario(request):
    noticias = list(Noticias.objects.all().order_by("on_modified"))[::-1]
    paginator = Paginator(noticias,5)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"plataforma/Noticias Usuario.html", {'page_obj':page_obj})

# Visualizar Noticias
@login_required
@pure_admin_required
def NoticiasView(request):
    noticias = list(Noticias.objects.all().order_by("on_modified"))[::-1]
    paginator = Paginator(noticias,5)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"plataforma/Noticias.html", {'page_obj':page_obj})

# Visualizar Noticia Admin
def VisualizarNoticiasAdmin(request,id):
    noticia = Noticias.objects.get(id=id)
    return render(request,"plataforma/Visualizar NoticiaA.html", {'noticia':noticia})

# Visualizar Noticia Admin
def VisualizarNoticiasUsuario(request,id):
    noticia = Noticias.objects.get(id=id)
    return render(request,"plataforma/Visualizar NoticiaU.html", {'noticia':noticia})

# Crear Noticias
@login_required
@pure_admin_required
def CrearNoticia(request):
    form = CrearNoticiasForm()
    if request.POST:
        noticia = Noticias()
        noticia.titulo = request.POST["titulo"]
        if request.FILES:
            noticia.imagen_cabecera = request.FILES["imagen_cabecera"]
        noticia.resumen = request.POST["resumen"]
        noticia.cuerpo = request.POST["cuerpo"]
        noticia.save()
        return redirect('Noticias')
    return render(request,"plataforma/Crear Noticia.html",{"form":form})

# Editar Noticias
@login_required
@pure_admin_required
def EditarNoticia(request,id):
    noticia = Noticias.objects.get(id=id)
    if request.POST:
        noticia.titulo = request.POST["titulo"]
        if request.FILES:
            noticia.imagen_cabecera = request.FILES["imagen_cabecera"]
        noticia.resumen = request.POST["resumen"]
        noticia.cuerpo = request.POST["cuerpo"]
        noticia.save()
        return redirect('Noticias')    
    return render(request,"plataforma/Editar Noticia.html",{"noticias":noticia})

# Eliminar Noticias
@login_required
@pure_admin_required
def EliminarNoticia(request,id):
    noticia = Noticias.objects.get(id=id)
    noticia.delete()
    return redirect("Noticias")

# Instalar Modulos PDF
@login_required
@pure_admin_required
def InstalarModulosPDF(request):
    return render(request,"plataforma/Instalacion Modulo.html")

@login_required
@pure_admin_required
def Grupos(request):
    grupos = Group.objects.annotate(user_count=Count('user'))
    return render(request,"plataforma/Grupos.html",{'grupos_query':grupos})

# Crear Grupo
@login_required
@pure_admin_required
def CrearGrupo(request:HttpRequest):
    if request.POST:
        nombre_grupo = request.POST['nombre_grupo']
        grupo = Group()
        grupo.name=nombre_grupo
        grupo.save()
        permisos_seleccioandos = request.POST.getlist('permisos[]')
        for permiso_id in permisos_seleccioandos:
            permiso = Permission.objects.get(id=permiso_id)
            grupo.permissions.add(permiso)
        grupo.save()
        return redirect ('Grupos')
    else:
        permisos = Permission.objects.all()
        context = {'permisos':permisos}
        return render(request,'plataforma/Crear Grupo.html', context)

# Editar Grupo
@login_required
@pure_admin_required
def EditarGrupo(request, id):
    grupo = Group.objects.get(id=id)
    permisos = Permission.objects.all()
    permisos_list = []
    for i in permisos:
        if i in grupo.permissions.all():
            permisos_list.append([True,i])
        else:
            permisos_list.append([False,i])
    if request.POST:
        grupo.name = request.POST['nombre_grupo']
        permisos_seleccioandos = request.POST.getlist('permisos[]')
        grupo.permissions.clear()
        for permiso_id in permisos_seleccioandos:
            permiso = Permission.objects.get(id=permiso_id)
            grupo.permissions.add(permiso)
        grupo.save()
        return redirect ('Grupos')
        
    else:
        
        context = {
            'permisos':permisos_list,
            'grupo': grupo,
            }
        return render(request,'plataforma/Editar Grupo.html', context)

# Eliminar Grupo
@login_required
@pure_admin_required
def EliminarGrupo(request, id):
    grupo = Group.objects.get(id=id)
    grupo.delete()
    return redirect("Grupos")

def Configuracion(request):
    email = Email.objects.get(id=1)
    context = {
        "email": email
    }
    return render(request,"plataforma/Configuracion.html",context)

@login_required
@pure_admin_required
def EditarEmail(request:HttpRequest):
    email = Email.objects.get(id=1)
    if request.POST:
        email.address = request.POST["address"]
        email.smtp_server = request.POST["smtp_server"]
        email.smtp_port = request.POST["smtp_port"]
        email.smtp_username = request.POST["smtp_username"]
        email.smtp_password = request.POST["smtp_password"]
        email.save()
        return redirect("Configuracion")
    form = EmailForm(instance=email)
    return render (request, "plataforma/Editar Email.html",{"form":form})


@method_decorator([login_required, pure_admin_required], name='dispatch')
class TramitesDetailAdmin(DetailView):
    model = Tramite
    template_name = "plataforma/Tramites Detail Admin.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tramite = self.get_object()

        #Variables para controlar qué formularios mostrar
        context['Pregrado_Nacional'] = tramite.tipo_pren and tramite.tipo_pren.strip()!= ''
        context['Pregrado_Nacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso.strip()!= ''
        context['Pregrado_Internacional'] = tramite.tipo_prei and tramite.tipo_prei.strip()!= ''
        context['Pregrado_Internacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso_i.strip()!= ''
        context['Posgrado_Nacional'] = tramite.tipo_posn and tramite.tipo_posn.strip()!= ''
        context['Posgrado_Nacional_Legalizacion'] = (tramite.tipo_est and tramite.uso and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso.strip()!= ''
        context['Posgrado_Internacional'] = tramite.tipo_posi and tramite.tipo_posi.strip()!= ''
        context['Posgrado_Internacional_Legalizacion'] = (tramite.tipo_est and tramite.uso_i and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso_i.strip()!= ''
        return context
    
@method_decorator([login_required], name='dispatch')
class TramitesDetailUsuario(DetailView):
    model = Tramite
    template_name = "plataforma/Tramites Detail Usuario.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tramite = self.get_object()

        #Variables para controlar qué formularios mostrar
        context['Pregrado_Nacional'] = tramite.tipo_pren and tramite.tipo_pren.strip()!= ''
        context['Pregrado_Nacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso.strip()!= ''
        context['Pregrado_Internacional'] = tramite.tipo_prei and tramite.tipo_prei.strip()!= ''
        context['Pregrado_Internacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso_i.strip()!= ''
        context['Posgrado_Nacional'] = tramite.tipo_posn and tramite.tipo_posn.strip()!= ''
        context['Posgrado_Nacional_Legalizacion'] = (tramite.tipo_est and tramite.uso and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso.strip()!= ''
        context['Posgrado_Internacional'] = tramite.tipo_posi and tramite.tipo_posi.strip()!= ''
        context['Posgrado_Internacional_Legalizacion'] = (tramite.tipo_est and tramite.uso_i and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso_i.strip()!= ''
        return context

class TramitesDetailAnonimo(DetailView):
    model = Tramite
    template_name = "plataforma/Tramites Detail Anonimo.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tramite = self.get_object()

        #Variables para controlar qué formularios mostrar
        context['Pregrado_Nacional'] = tramite.tipo_pren and tramite.tipo_pren.strip()!= ''
        context['Pregrado_Nacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso.strip()!= ''
        context['Pregrado_Internacional'] = tramite.tipo_prei and tramite.tipo_prei.strip()!= ''
        context['Pregrado_Internacional_Legalizacion'] = (tramite.tipo_estudio and tramite.uso_i and tramite.legalizacion) and tramite.tipo_estudio.strip()!= '' and tramite.uso_i.strip()!= ''
        context['Posgrado_Nacional'] = tramite.tipo_posn and tramite.tipo_posn.strip()!= ''
        context['Posgrado_Nacional_Legalizacion'] = (tramite.tipo_est and tramite.uso and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso.strip()!= ''
        context['Posgrado_Internacional'] = tramite.tipo_posi and tramite.tipo_posi.strip()!= ''
        context['Posgrado_Internacional_Legalizacion'] = (tramite.tipo_est and tramite.uso_i and tramite.legalizacion) and tramite.tipo_est.strip()!= '' and tramite.uso_i.strip()!= ''
        return context