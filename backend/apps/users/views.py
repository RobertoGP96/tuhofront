import uuid
from .forms import InformacionPersonalForm
from .models import Usuario
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout, password_validation
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from usuarios.models import Usuario
from django.contrib import messages
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm, ChangePasswordForm
from plataforma.custom_mail import custom_send_mail
from .services import authenticate_user, perform_login, register_user, validate_token, update_user_info

# Create your views here.

# Nombre de los Grupos
def group_names(group:Group):
    return group.name

# Verificar si ese usuario pertenece a ese grupo
def verify_group(usuario, group_name):
    if group_name in map(  group_names , list(usuario.groups.all())):
        return True
    else:
        return False

# Login
def Login(request:HttpRequest):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'user_id': request.user.id})
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate_user(username, password)
        if user is not None:
            perform_login(request, user)
            usuario = Usuario.objects.get(id=user.id)
            # determinar rol principal
            role = None
            if verify_group(usuario, "Administración"):
                role = "administration"
            elif verify_group(usuario, "Usuario"):
                role = "user"
            elif verify_group(usuario, "Administrador Trámites"):
                role = "tramites_admin"
            elif verify_group(usuario, "Administrador de Módulo"):
                role = "module_admin"
            else:
                role = "user"
            groups = [g.name for g in usuario.groups.all()]
            return JsonResponse({'success': True, 'user_id': usuario.id, 'role': role, 'groups': groups})
        else:
            return JsonResponse({'success': False, 'message': 'La información de cuenta no es correcta o su cuenta no ha sido verificada.'}, status=400)
    return JsonResponse({'detail': 'Use POST to authenticate (username, password).'})

# Register
def Registrar(request:HttpRequest):
    if request.method == 'POST':
        success, errors = register_user(request.POST)
        if success:
            return JsonResponse({'success': True, 'message': 'Su cuenta ha sido creada con éxito, verifique su email para validar su cuenta'})
        else:
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    return JsonResponse({'detail': 'Use POST to register (username, email, password1, password2).'})

# Confirmacion del Token de acceso
def TokenValidationView(request, token):
    try:
        success, message = validate_token(token)
        if success:
            return JsonResponse({'success': True, 'message': message})
        else:
            return JsonResponse({'success': False, 'message': message}, status=400)
    except Exception as e:
        print(e)
        return JsonResponse({'success': False, 'message': 'Ha ocurrido un error por favor intentelo de nuevo'}, status=500)

# Restablecer Contraseña
class RestablecerContraseña(auth_views.PasswordResetView):
    form_class = CustomPasswordResetForm
    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            form.save(request=request)
            return JsonResponse({'success': True, 'message': 'Email de restablecimiento enviado si el usuario existe.'})
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

# Cambiar Contraseña
class CambiarContraseña(auth_views.PasswordResetConfirmView):
    form_class = ChangePasswordForm
    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True, 'message': 'Contraseña cambiada con éxito.'})
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

# Confirmacion del Restablecer Contraseña  
def RestablecerContraseñaConfirmado(request):
    return JsonResponse({'detail': 'Password reset confirmed.'})

# Confirmación del Cambiar Contraseña
def CambiarContraseñaConfirmado(request):
    return JsonResponse({'detail': 'Password change confirmed.'})

# Cerrar Sesión
@login_required
def CerrarSesion(request:HttpRequest):
    logout(request)
    return JsonResponse({'success': True, 'message': 'Sesión cerrada'})


# Actualizar Información
@login_required
def ActualizarInf(request:HttpRequest):
    usuario = Usuario.objects.get(id=request.user.id)
    if request.method == 'POST':
        update_user_info(usuario, request.POST)
        return JsonResponse({'success': True, 'user_id': usuario.id})
    # GET: devolver información del usuario
    data = {
        'id': usuario.id,
        'username': usuario.username,
        'first_name': usuario.first_name,
        'last_name': usuario.last_name,
        'email': usuario.email,
        'carnet': getattr(usuario, 'carnet', None),
        'telefono': getattr(usuario, 'telefono', None),
        'direccion': getattr(usuario, 'direccion', None),
    }
    return JsonResponse({'success': True, 'user': data})
    





