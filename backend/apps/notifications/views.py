from django.shortcuts import redirect, render
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from apps.platform.models.user import User
from .models import Notificacion
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

# Bandeja de entrada
@login_required
def Bandeja(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja.html", {'page_obj':page_obj})

def BandejaAdmin(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja Admin.html", {'page_obj':page_obj})


def BandejaAdminGestor(request:HttpRequest) -> HttpResponse:
    usuario = request.user
    notificaciones = Notificacion.objects.filter(para=usuario)
    paginator = Paginator(notificaciones,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request,"Notificaciones/Bandeja Admin Gestores.html", {'page_obj':page_obj})

def BorrarNotificaciones(request:HttpRequest) -> HttpResponse:
    if request.POST:
        lista_elementos = request.POST.getlist('selected-item')
        for e in lista_elementos:
            Notificacion.objects.get(pk=e).delete()
    
    next_url = request.GET.get('next', 'Bandeja')
    return redirect(next_url)

def VisualizarNotificaciones(request:HttpRequest) -> HttpResponse:
    if request.POST:
        lista_elementos = request.POST.getlist('selected-item')
        for e in lista_elementos:
            notificacion = Notificacion.objects.get(pk=e)
            notificacion.visto = True
            notificacion.save()
    
    next_url = request.GET.get('next', 'Bandeja')
    return redirect(next_url)