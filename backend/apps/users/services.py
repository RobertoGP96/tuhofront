import uuid
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.contrib import messages

from .models import Usuario


def authenticate_user(username: str, password: str):
    try:
        user_obj = Usuario.objects.get(username=username)
    except Usuario.DoesNotExist:
        return None
    user = authenticate(username=user_obj.username, password=password)
    return user


def perform_login(request, user):
    login(request, user)


def register_user(request_data):
    username = request_data.get('username')
    email = request_data.get('email')
    password = request_data.get('password1')
    password2 = request_data.get('password2')

    if Usuario.objects.filter(username=username).exists():
        return False, ['Ya existe una cuenta con ese usuario.']
    if Usuario.objects.filter(email=email).exists():
        return False, ['Ya existe una cuenta con ese email.']
    if password and password2 and password != password2:
        return False, ['Las contraseñas deben coincidir']

    usuario = Usuario()
    usuario.username = username
    usuario.email = email
    usuario.token_activacion = str(uuid.uuid4())
    usuario.is_active = True
    usuario.set_password(password)
    try:
        usuario.save()
        try:
            grupo = Group.objects.get(name="Usuario")
            usuario.groups.add(grupo)
        except ObjectDoesNotExist:
            # Si el grupo no existe, ignora y continúa
            pass
        usuario.save()
        return True, []
    except Exception as e:
        return False, [str(e)]


def validate_token(token: str):
    profile_obj = Usuario.objects.filter(token_activacion=token).first()
    if not profile_obj:
        return False, 'No existe una cuenta con ese token o la verificación ha expirado'
    if profile_obj.is_active:
        return False, 'Su cuenta ya está verificada'
    profile_obj.is_active = True
    profile_obj.save()
    return True, 'Su cuenta ha sido verificada'


def update_user_info(user, data):
    # espera un objeto Usuario en `user` y un dict-like `data`
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.carnet = data.get('carnet', getattr(user, 'carnet', None))
    user.email = data.get('email', user.email)
    user.telefono = data.get('telefono', getattr(user, 'telefono', None))
    user.direccion = data.get('direccion', getattr(user, 'direccion', None))
    user.save()
    return user
