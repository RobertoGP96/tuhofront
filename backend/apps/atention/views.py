import uuid
from django.http import HttpRequest, JsonResponse
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
    if request.method == 'POST':
        try:
            atencionP = AtencionPoblacion()
            if request.user.is_authenticated:
                atencionP.usuario = request.user
            atencionP.nombre = request.POST.get("nombre")
            atencionP.apellidos = request.POST.get("apellidos")
            atencionP.email = request.POST.get("email")
            atencionP.ci = request.POST.get("ci")
            atencionP.telefono = request.POST.get("telefono")
            atencionP.direccion = request.POST.get("direccion")
            atencionP.municipality = request.POST.get('municipality')
            atencionP.consulta = request.POST.get('consulta')
            if request.FILES:
                atencionP.adjunto = request.FILES.get('adjunto')
            atencionP.asunto = request.POST.get('asunto')
            atencionP.mensaje = request.POST.get('mensaje')
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
            if request.FILES and atencionP.adjunto:
                mail.attach(atencionP.adjunto.name, atencionP.adjunto.read(), request.FILES['adjunto'].content_type)
            
            mail_usuario = EmailMessage(
                atencionP.asunto, 
                f"Tramite a nombre de: {atencionP.nombre} {atencionP.apellidos}\nEn fecha: {atencionP.created_at}\nTipo: {atencionP.consulta}\nToken: {atencionP.token}",
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
            return JsonResponse({'success': True, 'message': 'Se ha enviado su solicitud correctamente', 'ticket': atencionP.numero_seguimiento})
        except Exception as e:
            form_persist = AtencionPoblacionForm(request.POST)
            print(e)
            return JsonResponse({'success': False, 'message': 'Algo salió mal con el envio del correo'}, status=500)
    return JsonResponse({'detail': 'Use POST to create an AtencionPoblacion', 'form_fields': list(AtencionPoblacionForm().fields.keys())})

@login_required
@admin_required
def VisualizarAtencionPoblacion(request, id):
    aPoblacion = AtencionPoblacion.objects.get(id=id)
    data = {
        'id': aPoblacion.id,
        'nombre': aPoblacion.nombre,
        'apellidos': aPoblacion.apellidos,
        'email': aPoblacion.email,
        'ci': aPoblacion.ci,
        'telefono': aPoblacion.telefono,
        'direccion': aPoblacion.direccion,
        'municipality': aPoblacion.municipality,
        'consulta': aPoblacion.consulta,
        'asunto': aPoblacion.asunto,
        'mensaje': aPoblacion.mensaje,
        'numero_seguimiento': aPoblacion.numero_seguimiento,
        'created_at': aPoblacion.created_at,
    }
    return JsonResponse({'success': True, 'atencion': data})