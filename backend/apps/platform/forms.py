from django import forms
from django.forms import ModelForm
# from .models.models import Noticias , Email  # Importación incorrecta - Archivo deprecado
from django.contrib.auth.models import Group, Permission
from django import forms
from .models.user import User


# Formulario de Noticias (Deprecado - usar serializers en su lugar)
# class CrearNoticiasForm(ModelForm):
#     def __init__(self,*args,**kwargs):
#         super().__init__(*args,**kwargs)
#         
#     class Meta:
#         model = News
#         fields = '__all__'
#         widgets = {
#             'titulo' : forms.TextInput(attrs={'type':"text",'name':"titulo", 'class':"input", 'required':'true' ,'id': 'inputTitulo'}),
#             'imagen_cabecera': forms.FileInput(attrs={'type':"file",'name':"file", 'class':"input", 'id': 'inputImagen'}),
#             'resumen': forms.TextInput(attrs={'type':"text",'name':"resumen", 'class':"input", 'required':'true' ,'id': 'inputResumen'}),
#             'cuerpo' : forms.Textarea(attrs={'name':"cuerpo", 'class':"input", 'required':'true', 'id': 'inputText'}),
#             #'cuerpo' : CKEditorWidget(),
#         }
        
# class EmailForm(forms.ModelForm):  # Deprecado
#     def __init__(self,*args,**kwargs):
#         super().__init__(*args,**kwargs)
#     class Meta:
#         model = Email
#         fields = '__all__'
#         widgets = {
#             'address': forms.EmailInput(attrs={'type':"email",'name':"email", 'class':"input", 'required':'true' ,'id': 'inputEmail'}),
#             'smtp_server': forms.TextInput(attrs={'type':"text",'name':"server", 'class':"input", 'id': 'inputServer'}),
#             'smtp_port': forms.TextInput(attrs={'type':"text",'name':"port", 'class':"input", 'id': 'inputPort'}),
#             'smtp_username': forms.TextInput(attrs={'type':"text",'name':"username", 'class':"input", 'required':'true' ,'id': 'inputUsername'}),
#             'smtp_password': forms.TextInput(attrs={'type':"text",'name':"password", 'class':"input", 'required':'true' ,'id': 'inputPassword'}),
#         }

class UserInfoForm(forms.ModelForm):
    """Formulario para la edición de información del usuario"""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'id_card', 'phone',
            'address', 'date_of_birth', 'user_type', 'workplace'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombres'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Apellidos'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Correo electrónico',
                'type': 'email'
            }),
            'id_card': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Carnet de identidad',
                'maxlength': '11'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Teléfono',
                'maxlength': '15'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Dirección',
                'rows': 3
            }),
            'date_of_birth': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'user_type': forms.Select(attrs={
                'class': 'form-select'
            }),
            'workplace': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Centro de trabajo o estudio'
            })
        }