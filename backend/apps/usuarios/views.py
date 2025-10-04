import uuid
from .forms import InformacionPersonalForm
from .models import Usuario
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest
from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login, logout, password_validation
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from usuarios.models import Usuario
from django.contrib import messages
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm, ChangePasswordForm
from plataforma.custom_mail import custom_send_mail

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
        return redirect("Inicio")
    if request.POST:
        form_persist = request.POST
        username = request.POST['username']
        password = request.POST['password']
        try:
            user_to_auth = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return render(request, "usuarios/Login.html", {'response': 'incorrecto', 'message': "Campos 'Usuario' y 'Contraseña' son incorrectos",'form': form_persist})
        user = authenticate(request, username=user_to_auth.username, password=password)
        if user is not None:
            login(request, user)
            usuario = Usuario.objects.get(id=user.id)
            if verify_group(usuario, "Administración"):
                return redirect("Administracion")
            elif verify_group(usuario, "Usuario"):
                return redirect("Inicio")
            elif verify_group(usuario, "Administrador Trámites"):
                return redirect("Administracion")
            elif verify_group(usuario, "Administrador de Módulo"):
                return redirect("Sitio_Administrativo")
            elif verify_group(usuario, "Gestor General SD"):
                return redirect("Sitio_Administrativo")
            elif verify_group(usuario, "Gestores de Trámites Posgrado"):
                return redirect("Sitio_Administrativo")
            elif verify_group(usuario, "Gestores de Trámites Pregrado"):
                return redirect("Sitio_Administrativo")
            return redirect("Inicio")
        else:
            return render(request, "usuarios/Login.html", {'response': 'incorrecto', 'message': 'La información de cuenta no es correcta o su cuenta no ha sido verificada, verifique su correo electrónico','form': form_persist})
    return render(request, "usuarios/Login.html")

# Register
def Registrar(request:HttpRequest):
    if request.POST:
        form_persist = request.POST
        if Usuario.objects.filter(username=request.POST['username']).exists():
            return render(request, "usuarios/Registrar.html", {'response': 'incorrecto', 'messages': ['Ya existe una cuenta con ese usuario.'], 'form': form_persist})

        if Usuario.objects.filter(email=request.POST['email']).exists():
            return render(request, "usuarios/Registrar.html", {'response': 'incorrecto', 'messages': ['Ya existe una cuenta con ese email.'], 'form': form_persist})

        usuario = Usuario()
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password1']
        password2 = request.POST['password2']

        if password and password2 and password!= password2:
            return render(request, "usuarios/Registrar.html", {'response': 'incorrecto', 'messages': ['Las contraseñas deben coincidir'], 'form': form_persist})

        usuario.username = username
        usuario.email = email
        usuario.token_activacion = str(uuid.uuid4())
        usuario.is_active = True
        usuario.set_password(password)

        try:
            #validation = password_validation.validate_password(password, usuario)
            from config import settings
            from django.core.mail import send_mail
            #subject = "Su cuenta debe ser verificada"
            #El DOMAIN es el servidor y el puerto del sistema se encuentar en el settings por si hay que cambiarlo
            #message = f'Hola acceda a este enlace para validar su cuenta: {settings.DOMAIN}/Usuarios/verify/{usuario.token_activacion}'
            ##recipient_list = [usuario.email]
            #send_mail(
            #recipient_list=recipient_list,
            #subject= subject,
            #message=message,
            #from_email="smtp.gmail.com",
            #connection= custom_send_mail(), 
            #)
            usuario.save()
            usuario.groups.add(Group.objects.get(name="Usuario"))
            usuario.save()
            messages.success(request, "Su cuenta ha sido creada con éxito, verifique su email para validar su cuenta")
            return redirect("Login")
        except Exception as e:
            mensajes = []
            messages.error(request, "Algo salió mal realizando el registro, por favor intentelo de nuevo")
            print(e)
            return render(request, "usuarios/Registrar.html", {'form': form_persist})

    return render(request, "usuarios/Registrar.html")

# Confirmacion del Token de acceso
def TokenValidationView(request, token):
    try:
        profile_obj = Usuario.objects.filter(token_activacion = token).first()
        print(profile_obj)
        if profile_obj:
            if profile_obj.is_active:
                messages.info(request, 'Su cuenta ya está verificada')
                return redirect('Login')
            profile_obj.is_active = True
            profile_obj.save()
            messages.success(request, 'Su cuenta ha sido verificada')
            return redirect('Login')
        else:
            messages.error(request, 'No existe una cuenta con ese token o la verificación ha expirado')
            return redirect('Login')
    except Exception as e:
        messages.error(request, 'Ha ocurrido un error por favor intentelo de nuevo')
        print(e)

# Restablecer Contraseña
class RestablecerContraseña(auth_views.PasswordResetView):
    template_name = "usuarios/Restablecer Contraseña.html"
    form_class = CustomPasswordResetForm

# Cambiar Contraseña
class CambiarContraseña(auth_views.PasswordResetConfirmView):
    form_class = ChangePasswordForm
    template_name = "usuarios/Cambiar Contraseña.html"

# Confirmacion del Restablecer Contraseña  
def RestablecerContraseñaConfirmado(request):
    return render(request,"usuarios/Restablecer Contraseña Confirmado.html")

# Confirmación del Cambiar Contraseña
def CambiarContraseñaConfirmado(request):
    return render(request,"usuarios/Cambiar Contraseña Confirmado.html")

# Cerrar Sesión
@login_required
def CerrarSesion(request:HttpRequest):
    logout(request)
    return redirect("Inicio")


# Actualizar Información
@login_required
def ActualizarInf(request:HttpRequest):
    usuario = Usuario.objects.get(id=request.user.id)
    if request.POST:
        usuario.first_name = request.POST['first_name']
        usuario.last_name = request.POST['last_name']
        usuario.carnet = request.POST['carnet']
        usuario.email = request.POST['email']
        usuario.telefono = request.POST['telefono']
        usuario.direccion = request.POST['direccion']
        usuario.save()
        return redirect("InfoPersonal")
    form = InformacionPersonalForm(instance = usuario)
    return render(request,"usuarios/Actualizar Informacion Personal.html",{"form":form})
    





