from django import forms
from django.forms import ModelForm
from .models import Noticias , Email
from django.contrib.auth.models import Group, Permission


# Formulario de Noticias
class CrearNoticiasForm(ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        
    class Meta:
        model = Noticias
        fields = '__all__'
        widgets = {
            'titulo' : forms.TextInput(attrs={'type':"text",'name':"titulo", 'class':"input", 'required':'true' ,'id': 'inputTitulo'}),
            'imagen_cabecera': forms.FileInput(attrs={'type':"file",'name':"file", 'class':"input", 'id': 'inputImagen'}),
            'resumen': forms.TextInput(attrs={'type':"text",'name':"resumen", 'class':"input", 'required':'true' ,'id': 'inputResumen'}),
            'cuerpo' : forms.Textarea(attrs={'name':"cuerpo", 'class':"input", 'required':'true', 'id': 'inputText'}),
            #'cuerpo' : CKEditorWidget(),
        }

        
class EmailForm(forms.ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
    class Meta:
        model = Email
        fields = '__all__'
        widgets = {
            'address' : forms.EmailInput(attrs={'type':"email",'name':"email", 'class':"input", 'required':'true' ,'id': 'inputEmail'}),
            'smtp_server': forms.TextInput(attrs={'type':"text",'name':"server", 'class':"input", 'id': 'inputServer'}),
            'smtp_port': forms.TextInput(attrs={'type':"text",'name':"port", 'class':"input", 'id': 'inputPort'}),
            'smtp_username': forms.TextInput(attrs={'type':"text",'name':"username", 'class':"input", 'required':'true' ,'id': 'inputUsername'}),
            'smtp_password': forms.TextInput(attrs={'type':"text",'name':"password", 'class':"input", 'required':'true' ,'id': 'inputPassword'}),
        }