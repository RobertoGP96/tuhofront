
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { secretaryDocService } from "@/services/secretary-doc.service";
import { toast } from 'sonner';
import { ArrowLeft, Briefcase, CloudUpload, FileText, User, Loader2 } from "lucide-react";
import type { StudyType, InterestType, SecretaryDocProcedureForm } from "@/types/secretary-doc.types";

export const UnderNatProcedure = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const [formData, setFormData] = useState<Partial<SecretaryDocProcedureForm>>({
    study_type: 'PREGRADO',
    visibility_type: 'NACIONAL',
    interest: 'ESTATAL',
    full_name: user ? `${user.first_name} ${user.last_name || ''}` : '',
    email: user?.email || '',
    document_type: 'CERTIFICACION_PREGRADO',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name?.trim()) newErrors.full_name = 'El nombre es requerido';
    if (!formData.id_card?.trim()) {
      newErrors.id_card = 'El carné de identidad es requerido';
    } else if (!/^\d{11}$/.test(formData.id_card.trim())) {
      newErrors.id_card = 'El carné debe tener exactamente 11 dígitos numéricos';
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido';
    }
    if (formData.phone && !/^[+\d\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono no válido';
    }
    if (!formData.career?.trim()) newErrors.career = 'La carrera es requerida';
    if (!formData.year) newErrors.year = 'Seleccione un año';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await secretaryDocService.create({
        study_type: (formData.study_type || 'PREGRADO') as StudyType,
        visibility_type: formData.visibility_type || 'NACIONAL',
        career: formData.career || '',
        year: formData.year || '',
        academic_program: formData.academic_program || '',
        document_type: 'CERTIFICACION_PREGRADO',
        interest: (formData.interest || 'ESTATAL') as InterestType,
        full_name: formData.full_name || '',
        id_card: formData.id_card || '',
        email: formData.email || '',
        phone: formData.phone || '',
        document_file: documentFile || undefined,
      });
      
      toast.success("Trámite enviado — Su solicitud ha sido enviada exitosamente.");
      navigate('/procedures');
    } catch (error) {
      toast.error("Hubo un problema al enviar el trámite. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-gray-500 hover:text-primary-navy">
          <ArrowLeft size={16} />
          Volver
        </Button>
      </div>
      <Card className="shadow-2xl shadow-primary-navy/5 border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary-navy p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <FileText className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud Pregrado <span className="text-secondary-lime">Nacional</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Gestión de documentos académicos para uso dentro del territorio nacional.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-5 h-5 text-primary-navy" />
                <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Datos Personales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-xs font-bold uppercase text-gray-500">Nombre Completo *</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name || ''}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Ej: Juan Pérez García" 
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.full_name ? 'border-red-500' : ''}`}
                  />
                  {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_card" className="text-xs font-bold uppercase text-gray-500">Carné de Identidad *</Label>
                  <Input 
                    id="id_card" 
                    value={formData.id_card || ''}
                    onChange={(e) => handleChange('id_card', e.target.value)}
                    placeholder="11 dígitos" 
                    maxLength={11}
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.id_card ? 'border-red-500' : ''}`}
                  />
                  {errors.id_card && <p className="text-xs text-red-500">{errors.id_card}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-500">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="usuario@uho.edu.cu"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-gray-500">Teléfono de Contacto</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+53 5XXXXXXX"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Briefcase className="w-5 h-5 text-primary-navy" />
                <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Trámite</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="document_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Documento</Label>
                  <Select 
                    value={formData.document_type} 
                    onValueChange={(value) => handleChange('document_type', value)}
                  >
                    <SelectTrigger id="document_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDICE_ACADEMICO">Índice Académico</SelectItem>
                      <SelectItem value="CERTIFICACION_NOTAS">Certificación de Notas</SelectItem>
                      <SelectItem value="CERTIFICADO_TERMINADO">Certificado de Estudios Terminados</SelectItem>
                      <SelectItem value="COPIA_LITERAL">Copia Literal del Título</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="career" className="text-xs font-bold uppercase text-gray-500">Carrera / Facultad *</Label>
                  <Input 
                    id="career" 
                    value={formData.career || ''}
                    onChange={(e) => handleChange('career', e.target.value)}
                    placeholder="Nombre completo de la carrera"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.career ? 'border-red-500' : ''}`}
                  />
                  {errors.career && <p className="text-xs text-red-500">{errors.career}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs font-bold uppercase text-gray-500">Año de Graduación *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleChange('year', value)}
                  >
                    <SelectTrigger id="year" className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.year ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="----" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest" className="text-xs font-bold uppercase text-gray-500">Tipo de Interés</Label>
                  <Select 
                    value={formData.interest} 
                    onValueChange={(value) => handleChange('interest', value)}
                  >
                    <SelectTrigger id="interest" className="rounded-xl border-gray-100 bg-gray-50/50">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESTATAL">Estatal</SelectItem>
                      <SelectItem value="NO_ESTATAL">No Estatal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_file" className="text-xs font-bold uppercase text-gray-500">Anexo (Opcional)</Label>
                  <div className="relative group">
                    <Input 
                      id="document_file" 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden" 
                      onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="document_file" className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-primary-navy/30 transition-all text-sm text-gray-500 font-medium">
                      {documentFile ? (
                        <>
                          <FileText className="w-4 h-4 text-green-500" />
                          {documentFile.name}
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4 text-primary-navy" />
                          Subir archivo
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-400 font-medium max-w-xs italic text-center md:text-left">
                * Verifique que sus datos sean correctos antes de continuar. La institución procesará su solicitud en un plazo de 15 días hábiles.
              </p>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto bg-primary-navy hover:bg-primary-navy/90 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary-navy/20 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
