from .models import SecretaryDocProcedure, Tramite
from django import forms


class Posgrado_Nacional_Form(forms.ModelForm):
    
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'full_name',
            'id_card',
            'email',
            'phone',
            'career',
            'year',
            'document_type',
            'study_type',
            'visibility_type',
            'registry_volume',
            'folio',
            'registry_number',
            'academic_program',
            'interest'
        ]
        
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre completo del solicitante',
                'required': 'True',
                'maxlength': '300'
            }),
            'id_card': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de carné de identidad',
                'required': 'True',
                'maxlength': '15'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Correo electrónico',
                'required': 'True'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Teléfono de contacto',
                'required': 'True',
                'maxlength': '20'
            }),
            'career': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Carrera o programa académico',
                'required': 'True',
                'maxlength': '150'
            }),
            'year': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Año de estudio',
                'required': 'True',
                'maxlength': '10'
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de documento',
                'required': 'True',
                'maxlength': '100'
            }),
            'study_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de estudio',
                'required': 'True',
                'choices': 'STUDY_TYPE_CHOICES'
            }),
            'visibility_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Visibilidad',
                'required': 'True',
                'choices': 'STUDY_VISIBILITY_CHOICES'
            }),
            'registry_volume': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tomo del registro',
                'maxlength': '10'
            }),
            'folio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Folio del registro',
                'maxlength': '10'
            }),
            'registry_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número del registro',
                'maxlength': '10'
            }),
            'academic_program': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Programa académico',
                'required': 'True',
                'maxlength': '250'
            }),
            'interest': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de interés',
                'required': 'True',
                'choices': 'INTEREST_CHOICES'
            })
        }
        
        def clean(self):
            cleaned_data = super().clean()
            # Add any additional validation here
            return cleaned_data


class Posgrado_Nacional_Legalizacion_Form(forms.ModelForm):
    
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'full_name',
            'id_card',
            'email',
            'phone',
            'career',
            'year',
            'document_type',
            'study_type',
            'visibility_type',
            'registry_volume',
            'folio',
            'registry_number',
            'academic_program',
            'interest',
            'document_file'
        ]
        
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre completo del solicitante',
                'required': 'True',
                'maxlength': '300'
            }),
            'id_card': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de carné de identidad',
                'required': 'True',
                'maxlength': '15'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Correo electrónico',
                'required': 'True'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Teléfono de contacto',
                'required': 'True',
                'maxlength': '20'
            }),
            'career': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Carrera o programa académico',
                'required': 'True',
                'maxlength': '150'
            }),
            'year': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Año de estudio',
                'required': 'True',
                'maxlength': '10'
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de documento',
                'required': 'True',
                'maxlength': '100'
            }),
            'study_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de estudio',
                'required': 'True',
                'choices': 'STUDY_TYPE_CHOICES'
            }),
            'visibility_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Visibilidad',
                'required': 'True',
                'choices': 'STUDY_VISIBILITY_CHOICES'
            }),
            'registry_volume': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tomo del registro',
                'maxlength': '10'
            }),
            'folio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Folio del registro',
                'maxlength': '10'
            }),
            'registry_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número del registro',
                'maxlength': '10'
            }),
            'academic_program': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Programa académico',
                'required': 'True',
                'maxlength': '250'
            }),
            'interest': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de interés',
                'required': 'True',
                'choices': 'INTEREST_CHOICES'
            }),
            'document_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf',
                'required': 'True'
            })
        }
        
        def clean(self):
            cleaned_data = super().clean()
            # Add any additional validation here
            return cleaned_data
            
    def clean_document_file(self):
        document_file = self.cleaned_data.get('document_file')
        if document_file and not str(document_file).lower().endswith('.pdf'):
            raise forms.ValidationError("Solo se aceptan archivos PDF.")
        return document_file


class Posgrado_Internacional_Form(forms.ModelForm):
    
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'full_name',
            'id_card',
            'email',
            'phone',
            'career',
            'year',
            'document_type',
            'study_type',
            'visibility_type',
            'registry_volume',
            'folio',
            'registry_number',
            'academic_program',
            'interest',
            'document_file'
        ]
        
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre completo del solicitante',
                'required': 'True',
                'maxlength': '300'
            }),
            'id_card': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de carné de identidad',
                'required': 'True',
                'maxlength': '15'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Correo electrónico',
                'required': 'True'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Teléfono de contacto',
                'required': 'True',
                'maxlength': '20'
            }),
            'career': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Carrera o programa académico',
                'required': 'True',
                'maxlength': '150'
            }),
            'year': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Año de estudio',
                'required': 'True',
                'maxlength': '10'
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de documento',
                'required': 'True',
                'maxlength': '100'
            }),
            'study_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de estudio',
                'required': 'True',
                'choices': 'STUDY_TYPE_CHOICES'
            }),
            'visibility_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Visibilidad',
                'required': 'True',
                'choices': 'STUDY_VISIBILITY_CHOICES'
            }),
            'registry_volume': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tomo del registro',
                'maxlength': '10'
            }),
            'folio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Folio del registro',
                'maxlength': '10'
            }),
            'registry_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número del registro',
                'maxlength': '10'
            }),
            'academic_program': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Programa académico',
                'required': 'True',
                'maxlength': '250'
            }),
            'interest': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de interés',
                'required': 'True',
                'choices': 'INTEREST_CHOICES'
            }),
            'document_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf',
                'required': 'True'
            })
        }
        
        def clean(self):
            cleaned_data = super().clean()
            interest = cleaned_data.get('interest')
            
            # Validación adicional según el tipo de interés
            if interest == 'NO_ESTATAL':
                required_fields = [
                    'full_name', 'id_card', 'email', 'phone', 'career', 'year',
                    'document_type', 'study_type', 'visibility_type', 'academic_program',
                    'document_file'
                ]
                for field in required_fields:
                    if not cleaned_data.get(field):
                        self.add_error(field, 'Este campo es requerido para trámites internacionales')
            
            return cleaned_data
            
    def clean_document_file(self):
        document_file = self.cleaned_data.get('document_file')
        if document_file and not str(document_file).lower().endswith('.pdf'):
            raise forms.ValidationError("Solo se aceptan archivos PDF.")
        return document_file


class Posgrado_Internacional_Legalizacion_Form(forms.ModelForm):
    
    class Meta:
        model = SecretaryDocProcedure
        fields = [
            'full_name',
            'id_card',
            'email',
            'phone',
            'career',
            'year',
            'document_type',
            'study_type',
            'visibility_type',
            'registry_volume',
            'folio',
            'registry_number',
            'academic_program',
            'interest',
            'document_file'
        ]
        
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre completo del solicitante',
                'required': 'True',
                'maxlength': '300'
            }),
            'id_card': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de carné de identidad',
                'required': 'True',
                'maxlength': '15'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Correo electrónico',
                'required': 'True'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Teléfono de contacto',
                'required': 'True',
                'maxlength': '20'
            }),
            'career': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Carrera o programa académico',
                'required': 'True',
                'maxlength': '150'
            }),
            'year': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Año de estudio',
                'required': 'True',
                'maxlength': '10'
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de documento',
                'required': 'True',
                'maxlength': '100'
            }),
            'study_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de estudio',
                'required': 'True',
                'choices': 'STUDY_TYPE_CHOICES'
            }),
            'visibility_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Visibilidad',
                'required': 'True',
                'choices': 'STUDY_VISIBILITY_CHOICES'
            }),
            'registry_volume': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tomo del registro',
                'maxlength': '10'
            }),
            'folio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Folio del registro',
                'maxlength': '10'
            }),
            'registry_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número del registro',
                'maxlength': '10'
            }),
            'academic_program': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Programa académico',
                'required': 'True',
                'maxlength': '250'
            }),
            'interest': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de interés',
                'required': 'True',
                'choices': 'INTEREST_CHOICES'
            }),
            'document_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf',
                'required': 'True'
            })
        }
        
        def clean(self):
            cleaned_data = super().clean()
            interest = cleaned_data.get('interest')
            
            # Validación adicional para trámites internacionales
            if interest == 'NO_ESTATAL':
                required_fields = [
                    'full_name', 'id_card', 'email', 'phone', 'career', 'year',
                    'document_type', 'study_type', 'visibility_type', 'academic_program',
                    'document_file'
                ]
                for field in required_fields:
                    if not cleaned_data.get(field):
                        self.add_error(field, 'Este campo es requerido para trámites internacionales')
            
            return cleaned_data
            
    def clean_document_file(self):
        document_file = self.cleaned_data.get('document_file')
        if document_file and not str(document_file).lower().endswith('.pdf'):
            raise forms.ValidationError("Solo se aceptan archivos PDF.")
        return document_file