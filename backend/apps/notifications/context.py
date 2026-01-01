from .models import Notificacion, Usuario

def notificacionesContext(request):
    try:
        usuario = request.user
        notificaciones_count = Notificacion.objects.filter(para=usuario).count
        return {
            'notificaciones_count': notificaciones_count,
        }
    except:
        return {}