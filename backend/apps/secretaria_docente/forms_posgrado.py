from .models import (
    Tramite,
    )
from django import forms


class Posgrado_Nacional_Form(forms.ModelForm):
    
    class Meta:
        model = Tramite
        fields = {
            'nombre', 
            'apellidos',
            'ci',
            'email',
            'telefono',
            'organismo',
            'motivo',
            'funcionario', 
            'year',    
            'tomo',
            'folio',
            'numero',
            
            'tipo_posn',
            'tipo_est',
            'uso',
            'programa_academico',
            'nombre_programa',
        }
        widgets = {
            'nombre': forms.TextInput(attrs={'type':'text','name':'nombre','id':'name','class':'form-control', 'placeholder':'Introduzca su nombre'}),
            'apellidos': forms.TextInput(attrs={'type':'text','name':'apellidos','id':'lastName','class':'form-control','placeholder':'Introduzca sus apellidos'}),
            'ci': forms.NumberInput(attrs={'type':'text','name':'ci','id':'ci','class':'form-control','placeholder':'Introduzca su carnet de identidad'}),
            'email': forms.EmailInput(attrs={'type':'email','name':'email','id':'email','class':'form-control','placeholder':'Introduzca correo electrónico'}),
            'telefono': forms.NumberInput(attrs={'type':'tel','name':'telefono','id':'tel','class':'form-control', 'placeholder':'Introduzca su número de móvil'}),
            'organismo': forms.TextInput(attrs={'type':'text','name':'organismo','id':'organismo','class':'form-control', 'placeholder':'Introduzca el organismo'}),
            'motivo': forms.Textarea(attrs={'type':'text','name':'motivo','id':'motivo','class':'form-control', 'placeholder':'Introduzca el motivo de su trámite'}),
            'funcionario': forms.TextInput(attrs={'type':'text','name':'funcionario','id':'funcionario','class':'form-control','placeholder':'Introduzca el funcionario'}),
            'year': forms.TextInput(attrs={'type':'text','name':'year','id':'year','class':'form-control', 'placeholder':'Introduzca su año de graduado'}),
           'tomo': forms.TextInput(attrs={'type':'text','name':'tomo','id':'tomo','class':'form-control','placeholder':'Introduzca el tomo'}),
            'folio': forms.TextInput(attrs={'type':'text','name':'folio','id':'folio','class':'form-control','placeholder':'Introduzca el folio'}),
            'numero': forms.TextInput(attrs={'type':'text','name':'numero','id':'numero','class':'form-control', 'placeholder':'Introduzca el número'}),
           
            'tipo_posn': forms.Select(attrs={'type':'text','name':'tipo','id':'tipo','class':'form-control', 'value':'ts' , 'placeholder':'Seleccione el  trámite'}),
            'tipo_est': forms.Select(attrs={ 'name':'tipoestudio','id':'tipoestudio','class':'form-control'}),
            'uso': forms.Select(attrs={'name':'uso','id':'uso','class':'form-control'}),  
            'programa_academico': forms.Select(attrs={'name':'programa_academico','id':'programa_academico','class':'form-control'}),  
            'nombre_programa': forms.TextInput(attrs={'type':'text','name':'nombre_programa','id':'nombre_programa','class':'form-control', 'placeholder':'Introduzca el nombre del programa'}),
        }


class Posgrado_Nacional_Legalizacion_Form(forms.ModelForm):
    
    class Meta:
        model = Tramite
        fields = {
            'nombre', 
            'apellidos',
            'ci',
            'email',
            'telefono',
            'organismo',
            'motivo',
            'funcionario', 
            'year',    
            'tomo',
            'folio',
            'numero',
            'tipo_est',
            'uso',
            'programa_academico',
            'nombre_programa',
            'archivo',
        }
        widgets = {
            'nombre': forms.TextInput(attrs={'type':'text','name':'nombre','id':'name','class':'form-control', 'placeholder':'Introduzca su nombre'}),
            'apellidos': forms.TextInput(attrs={'type':'text','name':'apellidos','id':'lastName','class':'form-control','placeholder':'Introduzca sus apellidos'}),
            'ci': forms.NumberInput(attrs={'type':'text','name':'ci','id':'ci','class':'form-control','placeholder':'Introduzca su carnet de identidad'}),
            'email': forms.EmailInput(attrs={'type':'email','name':'email','id':'email','class':'form-control','placeholder':'Introduzca correo electrónico'}),
            'telefono': forms.NumberInput(attrs={'type':'tel','name':'telefono','id':'tel','class':'form-control', 'placeholder':'Introduzca su número de móvil'}),
            'organismo': forms.TextInput(attrs={'type':'text','name':'organismo','id':'organismo','class':'form-control', 'placeholder':'Introduzca el organismo'}),
            'motivo': forms.Textarea(attrs={'type':'text','name':'motivo','id':'motivo','class':'form-control', 'placeholder':'Introduzca el motivo de su trámite'}),
            'funcionario': forms.TextInput(attrs={'type':'text','name':'funcionario','id':'funcionario','class':'form-control','placeholder':'Introduzca el funcionario'}),
            'year': forms.TextInput(attrs={'type':'text','name':'year','id':'year','class':'form-control', 'placeholder':'Introduzca su año de graduado'}),
            'tomo': forms.TextInput(attrs={'type':'text','name':'tomo','id':'tomo','class':'form-control','placeholder':'Introduzca el tomo'}),
            'folio': forms.TextInput(attrs={'type':'text','name':'folio','id':'folio','class':'form-control','placeholder':'Introduzca el folio'}),
            'numero': forms.TextInput(attrs={'type':'text','name':'numero','id':'numero','class':'form-control', 'placeholder':'Introduzca el número'}),  
            'tipo_est': forms.Select(attrs={ 'name':'tipoestudio','id':'tipoestudio','class':'form-control'}),
            'uso': forms.Select(attrs={'name':'uso','id':'uso','class':'form-control'}),  
            'programa_academico': forms.Select(attrs={'name':'programa_academico','id':'programa_academico','class':'form-control'}),  
            'nombre_programa': forms.TextInput(attrs={'type':'text','name':'nombre_programa','id':'nombre_programa','class':'form-control', 'placeholder':'Introduzca el nombre del programa'}),
            'archivo': forms.FileInput(attrs={'accept': '.pdf','class':'form-control', 'name':'archivo', 'value':'archivo','id':'archivo','required': 'True'}),
            #'legalizacion': forms.forms.TextInput(attrs={'readonly': 'readonly',' type':'text','name':'legalizacion','id':'legalizacion','class':'form-control','required': 'True'})  
        }

    def clean_archivo(self):
        archivo = self.cleaned_data.get('archivo')
        if not archivo:
            raise forms.ValidationError("Este campo es requerido.")
        elif not str(archivo).endswith('.pdf'):
            raise forms.ValidationError("Solo se aceptan archivos PDF.")
        return archivo
    






class Posgrado_Internacional_Form(forms.ModelForm):
    
    class Meta:
        model = Tramite
        fields = {
            'nombre', 
            'apellidos',
            'ci',
            'email',
            'telefono',
            'organismo',
            'motivo',
            'funcionario', 
            'year',    
            'tomo',
            'folio',
            'numero',
            
            'tipo_posi',
            'tipo_est',
            'uso_i',
            'programa_academico',
            'nombre_programa',
            'organismo_op',
            'intereses',
        }
        widgets = {
            'nombre': forms.TextInput(attrs={'type':'text','name':'nombre','id':'name','class':'form-control', 'placeholder':'Introduzca su nombre'}),
            'apellidos': forms.TextInput(attrs={'type':'text','name':'apellidos','id':'lastName','class':'form-control','placeholder':'Introduzca sus apellidos'}),
            'ci': forms.NumberInput(attrs={'type':'text','name':'ci','id':'ci','class':'form-control','placeholder':'Introduzca su carnet de identidad'}),
            'email': forms.EmailInput(attrs={'type':'email','name':'email','id':'email','class':'form-control','placeholder':'Introduzca correo electrónico'}),
            'telefono': forms.NumberInput(attrs={'type':'tel','name':'telefono','id':'tel','class':'form-control', 'placeholder':'Introduzca su número de móvil'}),
            'organismo': forms.TextInput(attrs={'type':'text','name':'organismo','id':'organismo','class':'form-control', 'placeholder':'Introduzca el organismo'}),
            'motivo': forms.Textarea(attrs={'type':'text','name':'motivo','id':'motivo','class':'form-control', 'placeholder':'Introduzca el motivo de su trámite'}),
            'funcionario': forms.TextInput(attrs={'type':'text','name':'funcionario','id':'funcionario','class':'form-control','placeholder':'Introduzca el funcionario'}),
            'year': forms.TextInput(attrs={'type':'text','name':'year','id':'year','class':'form-control', 'placeholder':'Introduzca su año de graduado'}),
            'tomo': forms.TextInput(attrs={'type':'text','name':'tomo','id':'tomo','class':'form-control','placeholder':'Introduzca el tomo'}),
            'folio': forms.TextInput(attrs={'type':'text','name':'folio','id':'folio','class':'form-control','placeholder':'Introduzca el folio'}),
            'numero': forms.TextInput(attrs={'type':'text','name':'numero','id':'numero','class':'form-control', 'placeholder':'Introduzca el número'}),
           
            'tipo_posi': forms.Select(attrs={'type':'text','name':'tipo','id':'tipo','class':'form-control', 'value':'ts' , 'placeholder':'Seleccione el  trámite'}),
            'tipo_est': forms.Select(attrs={ 'name':'tipoestudio','id':'tipoestudio','class':'form-control'}),
            'uso_i': forms.Select(attrs={'name':'uso','id':'uso','class':'form-control'}),  
            'programa_academico': forms.Select(attrs={'name':'programa_academico','id':'programa_academico','class':'form-control'}),  
            'nombre_programa': forms.TextInput(attrs={'type':'text','name':'nombre_programa','id':'nombre_programa','class':'form-control', 'placeholder':'Introduzca el nombre del programa'}),
            'organismo_op':forms.Select(attrs={'name':'organismo_op','id':'organismo_op','class':'form-control'}),
            'intereses':forms.RadioSelect(attrs={ 'type':'radio','name':'intereses','id':'intereses','class':'form-check-input'}),
        }
        
        def clean(self):
            cleaned_data = super().clean()
            intereses = cleaned_data.get('intereses')

            # Si se selecciona 'Particular', todos los campos son requeridos excepto 'organismo' y 'motivo'
            if intereses == 'Particular':
                for field in ['nombre', 'apellidos', 'ci', 'email', 'telefono', 'funcionario', 'year', 'tomo', 'folio', 'numero', 'carrera', 'tipo_prei', 'tipo_estudio', 'uso_i', 'organismo_op']:
                    if not cleaned_data.get(field):
                        self.add_error(field, f'Este campo es requerido para la opción Particular.')
                    # Si se selecciona 'Estatal', todos los campos son requeridos excepto 'organismo_op'
            elif intereses == 'Estatal':
                for field in ['nombre', 'apellidos', 'ci', 'email', 'telefono', 'funcionario', 'year', 'tomo', 'folio', 'numero', 'carrera', 'tipo_prei', 'tipo_estudio', 'uso_i', 'organismo', 'motivo']:
                    if not cleaned_data.get(field):
                        self.add_error(field, f'Este campo es requerido para la opción Estatal.')
            else:

                return cleaned_data
                 

class Posgrado_Internacional_Legalizacion_Form(forms.ModelForm):
    class Meta:
        model = Tramite
        fields = {
            'nombre', 
            'apellidos',
            'ci',
            'email',
            'telefono',
            'organismo',
            'motivo',
            'funcionario', 
            'year',    
            'tomo',
            'folio',
            'numero',
            'tipo_est',
            'uso_i',
            'programa_academico',
            'nombre_programa',
            'archivo',
            'organismo_op',
            'intereses',
        }
        widgets = {
            'nombre': forms.TextInput(attrs={'type':'text','name':'nombre','id':'name','class':'form-control', 'placeholder':'Introduzca su nombre'}),
            'apellidos': forms.TextInput(attrs={'type':'text','name':'apellidos','id':'lastName','class':'form-control','placeholder':'Introduzca sus apellidos'}),
            'ci': forms.NumberInput(attrs={'type':'text','name':'ci','id':'ci','class':'form-control','placeholder':'Introduzca su carnet de identidad'}),
            'email': forms.EmailInput(attrs={'type':'email','name':'email','id':'email','class':'form-control','placeholder':'Introduzca correo electrónico'}),
            'telefono': forms.NumberInput(attrs={'type':'tel','name':'telefono','id':'tel','class':'form-control', 'placeholder':'Introduzca su número de móvil'}),
            'organismo': forms.TextInput(attrs={'type':'text','name':'organismo','id':'organismo','class':'form-control', 'placeholder':'Introduzca el organismo'}),
            'motivo': forms.Textarea(attrs={'type':'text','name':'motivo','id':'motivo','class':'form-control', 'placeholder':'Introduzca el motivo de su trámite'}),
            'funcionario': forms.TextInput(attrs={'type':'text','name':'funcionario','id':'funcionario','class':'form-control','placeholder':'Introduzca el funcionario'}),
            'year': forms.TextInput(attrs={'type':'text','name':'year','id':'year','class':'form-control', 'placeholder':'Introduzca su año de graduado'}),
            'tomo': forms.TextInput(attrs={'type':'text','name':'tomo','id':'tomo','class':'form-control','placeholder':'Introduzca el tomo'}),
            'folio': forms.TextInput(attrs={'type':'text','name':'folio','id':'folio','class':'form-control','placeholder':'Introduzca el folio'}),
            'numero': forms.TextInput(attrs={'type':'text','name':'numero','id':'numero','class':'form-control', 'placeholder':'Introduzca el número'}),  
            'tipo_est': forms.Select(attrs={ 'name':'tipoestudio','id':'tipoestudio','class':'form-control'}),
            'uso_i': forms.Select(attrs={'name':'uso','id':'uso','class':'form-control'}),  
            'programa_academico': forms.Select(attrs={'name':'programa_academico','id':'programa_academico','class':'form-control'}),  
            'nombre_programa': forms.TextInput(attrs={'type':'text','name':'nombre_programa','id':'nombre_programa','class':'form-control', 'placeholder':'Introduzca el nombre del programa'}),
            'archivo': forms.FileInput(attrs={'accept': '.pdf','class':'form-control', 'name':'archivo', 'value':'archivo','id':'arhivo','required': 'True'}),
            #'legalizacion': forms.forms.TextInput(attrs={'readonly': 'readonly',' type':'text','name':'legalizacion','id':'legalizacion','class':'form-control','required': 'True'})  
            'organismo_op':forms.Select(attrs={'name':'organismo_op','id':'organismo_op','class':'form-control'}),
            'intereses':forms.RadioSelect(attrs={ 'type':'radio','name':'intereses','id':'intereses','class':'form-check-input'}),
        }

    def clean_archivo(self):
        archivo = self.cleaned_data.get('archivo')
        if not archivo:
            raise forms.ValidationError("Este campo es requerido.")
        elif not str(archivo).endswith('.pdf'):
            raise forms.ValidationError("Solo se aceptan archivos PDF.")
        return archivo
    