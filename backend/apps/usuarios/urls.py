from django.urls import path
from usuarios import views 
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views




urlpatterns = [
    path('login/', views.Login, name="Login"),
    path('register/', views.Registrar, name="Registrar"),
    path('CerrarSesion/',login_required(views.CerrarSesion), name="CerrarSesion"), 
    # Contraseña Olvidada
    path('verify/<token>', views.TokenValidationView , name="token_verify"),
    path('reset_password/', views.RestablecerContraseña.as_view() , name="password_reset"),
    path('reset_password_send/', views.RestablecerContraseñaConfirmado, name="password_reset_done"),
    path('reset/<uidb64>/<token>', views.CambiarContraseña.as_view(), name="password_reset_confirm"),
    path('reset_password_complete/', views.CambiarContraseñaConfirmado, name="password_reset_complete"),
     # Informacion Personal
    path('ActualizarInf/', login_required(views.ActualizarInf), name="ActualizarInf"),
]