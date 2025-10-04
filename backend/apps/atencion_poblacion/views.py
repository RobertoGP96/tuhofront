import uuid
from django.http import HttpRequest
from django.shortcuts import render, redirect
from usuarios.models import Usuario
from django.core.mail import send_mail, EmailMessage
from .models import AtencionPoblacion
from .forms import AtencionPoblacionForm
from plataforma.decorators import pure_admin_required, admin_required
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from plataforma.custom_mail import custom_send_mail
from notificaciones.models import Notificacion
from datetime import datetime

# Create your views here.
# Atencion a la Población
def AtencionPoblacionView(request:HttpRequest):
    form = AtencionPoblacionForm()
    if request.POST:
        try:
            atencionP = AtencionPoblacion()
            if request.user.is_authenticated:
                atencionP.usuario = request.user
            atencionP.nombre = request.POST["nombre"]
            atencionP.apellidos = request.POST["apellidos"]
            atencionP.email = request.POST["email"]
            atencionP.ci = request.POST["ci"]
            atencionP.telefono = request.POST["telefono"]
            atencionP.direccion = request.POST["direccion"]
            atencionP.municipality = request.POST['municipality']
            atencionP.consulta = request.POST['consulta']
            if request.FILES:
                atencionP.adjunto = request.FILES['adjunto']
            atencionP.asunto = request.POST['asunto']
            atencionP.mensaje = request.POST['mensaje']
            atencionP.numero_seguimiento = str(uuid.uuid4())
            
            #email
            admin_list = [i.email for i in Usuario.objects.filter(groups__name="Administración")]
            if atencionP.usuario == "" or atencionP.usuario == None:
                message = f"Email: { atencionP.email}\nNombre del solicitante: { atencionP.nombre}\nApellidos del solicitante: { atencionP.apellidos}\nCarnet: { atencionP.ci}\nTeléfono: { atencionP.telefono}\nDirección: { atencionP.direccion}\nMunicipio: {atencionP.municipality}\nTipo de consulta: {atencionP.consulta}\nAsunto: {atencionP.asunto}\nMensaje: {atencionP.mensaje}"
            else:
                message = f"Email: { atencionP.email}\nNombre del usuario: { atencionP.usuario}\nNombre del solicitante: { atencionP.nombre}\nApellidos del solicitante: { atencionP.apellidos}\nCarnet: { atencionP.ci}\nTeléfono: { atencionP.telefono}\nDirección: { atencionP.direccion}\nMunicipio: {atencionP.municipality}\nTipo de consulta: {atencionP.consulta}\nAsunto: {atencionP.asunto}\nMensaje: {atencionP.mensaje}"
            
            mail = EmailMessage(
                atencionP.asunto, 
                message,
                "smtp.gmail.com",
                admin_list,
                connection=custom_send_mail(),
            )
            if request.FILES:
                mail.attach(atencionP.adjunto.name, atencionP.adjunto.read(), request.FILES['adjunto'].content_type)
            
            mail_usuario = EmailMessage(
                atencionP.asunto, 
                f"Tramite a nombre de: {atencionP.nombre} {atencionP.apellidos}\nEn fecha: {atencionP.on_create}\nTipo: {atencionP.consulta}\nToken: {atencionP.token}",
                "smtp.gmail.com",
                [atencionP.email],
                connection=custom_send_mail(),
            )
            mail_usuario.send()
            mail.send()

            atencionP.save()
            if request.user.is_authenticated:
                Notificacion(
                    tipo="Info",
                    asunto="Trámite creado",
                    cuerpo=f"Ha creado un trámite con Ticket: {atencionP.numero_seguimiento}",
                    para=request.user,
                    creado=datetime.now()
                    ).save()
            return render(request, "AtencionPoblacion/Atención a la Poblacion.html", {'response': 'correcto', 'message': 'Se ha enviado su solicitud correctamente', 'form': form})
        except Exception as e:
            form_persist = AtencionPoblacionForm(request.POST)
            messages.error(request, "Algo salió mal con el envio del correo, por favor intentelo de nuevo")
            print(e)
            return render(request, "AtencionPoblacion/Atención a la Poblacion.html", {'form': form_persist})
    return render(request, "AtencionPoblacion/Atención a la Poblacion.html", {'form': form})

@login_required
@admin_required
def VisualizarAtencionPoblacion(request, id):
    aPoblacion = AtencionPoblacion.objects.get(id=id)
    return render(request,'AtencionPoblacion/Visualizar Atención a la Poblacion.html',{'form':aPoblacion})