
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
import { parseApiError } from "@/utils";
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, CloudUpload, FileCheck, Fingerprint, User, Loader2 } from "lucide-react";
import type { StudyType, InterestType, SecretaryDocProcedureForm } from "@/types/secretary-doc.types";

export const TitleLegalization = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SecretaryDocProcedureForm>>({
    study_type: 'PREGRADO',
    visibility_type: 'NACIONAL',
    interest: 'ESTATAL',
    academic_program: 'Carrera Universitaria',
    full_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    document_type: 'LEGALIZACION_TITULO',
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
    if (!formData.email?.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[+\d\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono no válido';
    }
    if (!formData.career?.trim()) newErrors.career = 'La carrera es requerida';
    if (!formData.year?.trim()) newErrors.year = 'El año es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const created = await secretaryDocService.create({
        study_type: (formData.study_type || 'PREGRADO') as StudyType,
        visibility_type: formData.visibility_type || 'NACIONAL',
        career: formData.career || '',
        year: formData.year || '',
        academic_program: formData.academic_program || 'Carrera Universitaria',
        document_type: 'LEGALIZACION_TITULO',
        interest: (formData.interest || 'ESTATAL') as InterestType,
        full_name: formData.full_name || '',
        id_card: formData.id_card || '',
        email: formData.email || '',
        phone: formData.phone || '',
        document_file: documentFile || undefined,
        registry_volume: formData.registry_volume,
        folio: formData.folio,
        number: formData.number,
      });

      toast.success("Trámite enviado correctamente.");
      navigate(`/procedures/secretary/${created.id}`, { state: { justCreated: true } });
    } catch (error) {
      console.error('Error creando trámite:', error);
      toast.error(parseApiError(error, 'Hubo un problema al enviar el trámite. Intente de nuevo.'));
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
              <FileCheck className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Legalización <span className="text-secondary-lime">de Título</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Validación oficial de títulos universitarios para trámites legales y profesionales.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit}>
            {/* Identity Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-5 h-5 text-primary-navy" />
                <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Identificación del Solicitante</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-xs font-bold uppercase text-gray-500">Nombre Completo *</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name || ''}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Nombre completo" 
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
                    placeholder="Número de carné" 
                    maxLength={11}
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.id_card ? 'border-red-500' : ''}`}
                  />
                  {errors.id_card && <p className="text-xs text-red-500">{errors.id_card}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-500">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="correo@uho.edu.cu"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-gray-500">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Número de teléfono"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Registry Info (Specific for Legalization) */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <BookOpen className="w-5 h-5 text-primary-navy" />
                <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Datos del Registro</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="registry_volume" className="text-xs font-bold uppercase text-gray-500">Tomo</Label>
                  <Input 
                    id="registry_volume" 
                    value={formData.registry_volume || ''}
                    onChange={(e) => handleChange('registry_volume', e.target.value)}
                    placeholder="Ej: 45" 
                    className="rounded-xl border-gray-100 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folio" className="text-xs font-bold uppercase text-gray-500">Folio</Label>
                  <Input 
                    id="folio" 
                    value={formData.folio || ''}
                    onChange={(e) => handleChange('folio', e.target.value)}
                    placeholder="Ej: 12" 
                    className="rounded-xl border-gray-100 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-xs font-bold uppercase text-gray-500">Número</Label>
                  <Input 
                    id="number" 
                    value={formData.number || ''}
                    onChange={(e) => handleChange('number', e.target.value)}
                    placeholder="Ej: 301" 
                    className="rounded-xl border-gray-100 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="study_type" className="text-xs font-bold uppercase text-gray-500">Nivel de Estudio</Label>
                  <Select 
                    value={formData.study_type} 
                    onValueChange={(value) => handleChange('study_type', value)}
                  >
                    <SelectTrigger id="study_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREGRADO">Pregrado</SelectItem>
                      <SelectItem value="POSGRADO">Postgrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career" className="text-xs font-bold uppercase text-gray-500">Carrera / Programa *</Label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs font-bold uppercase text-gray-500">Año de Estudio *</Label>
                  <Input
                    id="year"
                    value={formData.year || ''}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="Ej: 2024"
                    className={`rounded-xl border-gray-100 bg-gray-50/50 ${errors.year ? 'border-red-500' : ''}`}
                  />
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
              </div>
            </div>

            {/* Verification Section */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Fingerprint className="w-5 h-5 text-primary-navy" />
                <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Verificación y Soporte</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_file" className="text-xs font-bold uppercase text-gray-500">Copia del Título (Escaneado)</Label>
                <div className="relative group">
                  <Input 
                    id="document_file" 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden" 
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="document_file" className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-secondary-lime transition-all">
                    {documentFile ? (
                      <>
                        <FileCheck className="w-8 h-8 text-green-500 mb-1" />
                        <span className="text-sm text-gray-600 font-bold">{documentFile.name}</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-8 h-8 text-primary-navy mb-1" />
                        <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Seleccionar Archivo</span>
                        <span className="text-xs text-gray-400 font-medium">Formato PDF altamente recomendado</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-400 font-medium max-w-sm italic text-center md:text-left">
                * La legalización de título es un trámite presencial para la entrega del documento físico original, esta solicitud digital inicia el proceso de verificación interna.
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
                  'Solicitar Legalización'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
