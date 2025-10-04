from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.forms.models import BaseModelForm
from django.http.response import HttpResponse
from django.http import HttpResponseRedirect
from django.http.request import HttpRequest
from django.contrib.auth.models import User
from django.contrib import messages
from django.urls import reverse_lazy
from django.db.models import Q
from django.urls import reverse
from datetime import datetime
from django.utils import timezone
from notificaciones.models import Notificacion
from.correo import (
    email_tramite_pregrado_nacional,
    email_tramite_pregrado_internacional,
    email_tramite_posgrado_nacional,
    email_tramite_posgrado_internacional,
    )
import datetime
import uuid
import re

from .models import Tramite
from .forms_pregrado import (
    Pregrado_Nacional_Form,
    Pregrado_Nacional_Legalizacion_Form,

    Pregrado_Internacional_Form,
    Pregrado_Internacional_Legalizacion_Form,
    )
from .forms_posgrado import (
    Posgrado_Nacional_Form,
    Posgrado_Nacional_Legalizacion_Form,

    Posgrado_Internacional_Form,
    Posgrado_Internacional_Legalizacion_Form,
    )
from django.views.generic import (
    CreateView,
    DetailView,
    ListView,
    DeleteView,
    )

def generar_numero_seguimiento_unico():
    date_part = datetime.datetime.now().strftime('%Y%m%d')
    short_date_part = date_part[:4]
    potential_unique_id = f"{short_date_part}-{uuid.uuid4().hex[:8]}"
    
    # Verifica si el identificador ya existe en la base de datos
    while Tramite.objects.filter(numero_seguimiento=potential_unique_id).exists():
        # Regenera un nuevo identificador si es necesario
        short_date_part = datetime.datetime.now().strftime('%Y%m%d')[:4]
        potential_unique_id = f"{short_date_part}-{uuid.uuid4().hex[:8]}"
    return potential_unique_id  

def Tramites_Anonymous(request):
    numero_seguimiento = request.GET.get('numero_seguimiento', '').strip()
    regex = r'^\d{4}-[a-f0-9]{8}$'
    
    tramites_filtrados = None
    tramites_encontrados = False  # Inicializa tramites_encontrados como False

    if numero_seguimiento:
        if re.match(regex, numero_seguimiento):
            tramites_filtrados = Tramite.objects.filter(numero_seguimiento__icontains=numero_seguimiento)
            tramites_encontrados = tramites_filtrados.exists()
        else:
            tramites_filtrados = None
            tramites_encontrados = False
    else:
        tramites_filtrados = None
        tramites_encontrados = False

    contexto = {
        'tramites': tramites_filtrados,
        'tramites_encontrados': tramites_encontrados,
        'mensaje': ''  
    }
 
    if not numero_seguimiento or not re.match(regex, numero_seguimiento):
        contexto['mensaje'] = 'Por favor, introduce un número de seguimiento válido.'
    elif not tramites_encontrados:
        contexto['mensaje'] = 'No se encontraron trámites con el número de seguimiento proporcionado.'

    return render(request, 'Tramites/anonymous.html', contexto)


# NACIONAL

class Tramites_Pregrado_Nacional_Create(CreateView):
    model = Tramite
    form_class = Pregrado_Nacional_Form
    template_name = "Tramites/Pregrado/Nac/tramite_pregrado_nacional.html" 
    success_url = reverse_lazy('Tramites_Pregrado_Nacional_Create')
    
    def form_valid(self, form):
        if self.request.user.is_authenticated:
           form.instance.usuario = self.request.user

        response = super().form_valid(form)
        tramite = self.object  # Accede al objeto Tramite recién creado
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        if self.request.user.is_authenticated:
            Notificacion(
                tipo="Info",
                asunto="Trámite creado",
                cuerpo=f"Ha creado un trámite con Ticket: {tramite.numero_seguimiento}",
                para=self.request.user,
                creado=timezone.now()
            ).save()
        
        try:
            email_tramite_pregrado_nacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
            messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")

        return response
    
@login_required
def Tramites_Usuario(request:HttpRequest) -> HttpResponse:
    usuariom = request.user
    query = Tramite.objects.filter(usuario=usuariom)
    
    if request.POST:
        query = []
        consulta_gral = Tramite.objects.all()
        for q in consulta_gral:
            if str(q.numero_seguimiento) == request.POST['numero_seguimiento']:
                query.append(q)
    
    context = {
        'Tramites': query,
    }
    return render(request, "Tramites/tramites_list usuario.html", context)


def Tramites_Delete_User(request,id):
    tramite = Tramite.objects.get(id=id)
    tramite.delete()
    return redirect("Tramites_Usuario")


def Tramites_Delete_User_Anonymous(request,id):
    tramite = Tramite.objects.get(id=id)
    tramite.delete()
    return redirect("Tramites_Anonymous")

class Tramites_Detail_Usuario(DetailView):
    model = Tramite
    template_name = "Tramites/tramites_detail_usuario.html"
    
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

class Tramites_Detail(DetailView):
    model = Tramite
    template_name = "Tramites/tramites_detail.html"
    
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
    
class Pregrado_Nacional_Legalizacion(CreateView):
    model = Tramite  
    form_class = Pregrado_Nacional_Legalizacion_Form 
    template_name = "Tramites/Pregrado/Nac/tramite_pregrado_nacional_legalizacion.html"  
    success_url = reverse_lazy('Pregrado_Nacional_Legalizacion') 

    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object  # Accede al objeto Tramite recién creado
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        if self.request.user.is_authenticated:
            Notificacion(
                tipo="Info",
                asunto="Trámite creado",
                cuerpo=f"Ha creado un trámite con Ticket: {tramite.numero_seguimiento}",
                para=self.request.user,
                creado=timezone.now()
            ).save()
        
        try:
            email_tramite_pregrado_nacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
            messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")

        return response
    
   
# Pregrado Internacional
def Tramites_Pregrado_Internacional_Create(request:HttpRequest) -> HttpResponse:
    if request.POST:
        usuario = request.user
        nuevo = Pregrado_Internacional_Form(request.POST)
        nuevo.instance.numero_seguimiento = generar_numero_seguimiento_unico()
        if usuario.is_authenticated:
            nuevo.instance.usuario = usuario
        if nuevo.is_valid():
            nuevo.save()
            
            try:
                email_tramite_pregrado_internacional(nuevo.instance)
                messages.success(request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
            except Exception as e:
                messages.error(request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")
        else:
            pass

    context = {
        'form': Pregrado_Internacional_Form(initial={'intereses': 'Estatal'})
    }
    return render(request, 'Tramites/Pregrado/Int/tramite_pregrado_internacional.html', context)


class Pregrado_Internacional_Legalizacion(CreateView):
    model = Tramite  
    form_class = Pregrado_Internacional_Legalizacion_Form 
    template_name = "Tramites/Pregrado/Int/tramite_pregrado_internacional_legalizacion.html"  
    success_url = reverse_lazy('Pregrado_Internacional_Legalizacion') 

    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object  # Accede al objeto Tramite recién creado
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        
        try:
            email_tramite_pregrado_internacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
            messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")

        return response
    
   
#Posgrado Nacional
class Tramites_Posgrado_Nacional_Create(CreateView):
    model = Tramite
    form_class = Posgrado_Nacional_Form
    template_name = "Tramites/Posgrado/Nac/tramite_posgrado_nacional.html" 
    success_url = reverse_lazy('Tramites_Posgrado_Nacional_Create')
    
    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object  # Accede al objeto Tramite recién creado
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        if self.request.user.is_authenticated:
            Notificacion(
                tipo="Info",
                asunto="Trámite creado",
                cuerpo=f"Ha creado un trámite con Ticket: {tramite.numero_seguimiento}",
                para=self.request.user,
                creado=timezone.now()
            ).save()
        try:
            email_tramite_posgrado_nacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
            messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")
        return response
    
class Tramite_Posgrado_Nacional_Create_Legalizacion(CreateView):
    model = Tramite
    form_class = Posgrado_Nacional_Legalizacion_Form
    template_name = "Tramites/Posgrado/Nac/posgrado_nacional_legalizacion.html" 
    success_url = reverse_lazy('Tramite_Posgrado_Nacional_Create_Legalizacion')
    
    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object 
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        if self.request.user.is_authenticated:
            Notificacion(
                tipo="Info",
                asunto="Trámite creado",
                cuerpo=f"Ha creado un trámite con Ticket: {tramite.numero_seguimiento}",
                para=self.request.user,
                creado=timezone.now()
            ).save()
        try:
            email_tramite_posgrado_nacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
            messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")
        return response
    
class Tramite_Posgrado_Internacional_Create(CreateView):
    model = Tramite
    form_class = Posgrado_Internacional_Form
    template_name = "Tramites/Posgrado/Int/tramite_posgrado_internacional.html" 
    success_url = reverse_lazy('Tramite_Posgrado_Internacional_Create')
    
    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object 
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        
        try:
            email_tramite_posgrado_internacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
                messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")
        return response
       
class Tramite_Posgrado_Internacional_Legalizacion(CreateView):
    model = Tramite
    form_class = Posgrado_Internacional_Legalizacion_Form
    template_name = "Tramites/Posgrado/Int/tramite_posgrado_internacional_legalizacion.html" 
    success_url = reverse_lazy('Tramite_Posgrado_Internacional_Legalizacion')
    
    def form_valid(self, form):
        if self.request.user.is_authenticated:
            form.instance.usuario = self.request.user
        response = super().form_valid(form)
        tramite = self.object 
        tramite.numero_seguimiento = generar_numero_seguimiento_unico()
        tramite.save()
        
        try:
            email_tramite_posgrado_internacional(tramite)
            messages.success(self.request, "Se ha enviado un correo electrónico con los detalles de su solicitud.")
        except Exception as e:
                messages.error(self.request, f"Algo salió mal con el envío del correo, por favor intentelo de nuevo")
        return response
       