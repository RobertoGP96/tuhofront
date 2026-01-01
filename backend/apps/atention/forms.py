from django import forms
from django.forms import ModelForm
from .models import AtencionPoblacion
from secretaria_docente.models import Tramite


# Formulario de Usuario
class AtencionPoblacionForm(ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        
    class Meta:
        model = AtencionPoblacion
        fields = '__all__'
        widgets = {
            'nombre' : forms.TextInput(attrs={'type':"text",'name':"name", 'class':"input", 'required':'true', 'id': 'inputName'}),
            'apellidos' : forms.TextInput(attrs={'type':"text",'name':"name", 'class':"input", 'required':'true', 'id': 'inputLastName'}),
            'ci' : forms.TextInput(attrs={'type':"text",'name':"name", 'class':"input", 'required':'true', 'id': 'inputCi'}),
            'email': forms.EmailInput(attrs={'type':"text",'name':"email", 'class':"input", 'required':'true', 'id': 'inputEmail'}),
            'telefono' : forms.TextInput(attrs={'type':"text",'name':"phone", 'class':"input", 'required':'true', 'id': 'inputNt'}),
            'direccion' : forms.TextInput(attrs={'type':"text",'name':"direccion", 'class':"input", 'required':'true', 'id': 'inputD'}),
            'asunto' : forms.TextInput(attrs={'type':"text",'name':"subject", 'class':"input", 'required':'true', 'id': 'inputA'}),
            'adjunto' : forms.FileInput(attrs={'type':"file",'name':"file", 'class':"input", 'id': 'inputAA'}),
            'mensaje' : forms.Textarea(attrs={'name':"message", 'class':"input", 'id': 'inputText','required':'true'}),
            
            
        }


class CambiarEstadoForm(forms.ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        
    class Meta:
        model = AtencionPoblacion
        fields = {
            'estado'
        }
        widgets = {
            'estado' : forms.Select(attrs={'class':"form-control", 'id': 'selectEstado'}),   
        }

class CambiarEstadoClaudiaForm(forms.ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        
    class Meta:
        model = Tramite
        fields = {
            'estado'
        }
        widgets = {
            'estado' : forms.Select(attrs={'class':"form-control", 'id': 'selectEstado'}),   
        }