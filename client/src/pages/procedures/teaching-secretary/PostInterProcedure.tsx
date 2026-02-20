
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
import { CloudUpload, Globe, GraduationCap, User } from "lucide-react";

export const PostInterProcedure = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const documentTypes = [
    { value: 'Crédito Académico', label: 'Crédito Académico' },
    { value: 'Certificación de Notas', label: 'Certificación de Notas' },
    { value: 'Certifico de Estudios Terminados', label: 'Certifico de Estudios Terminados' },
    { value: 'Copia Literal del Título', label: 'Copia Literal del Título' },
    { value: 'Plan de Estudio', label: 'Plan de Estudio' },
    { value: 'Plan Temático', label: 'Plan Temático' },
  ];

  const academicPrograms = [
    { value: 'Especialidad', label: 'Especialidad' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-2xl shadow-primary-navy/5 border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary-navy p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Globe className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud Postgrado <span className="text-secondary-lime">Internacional</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Documentación para trámites de postgrado con validez fuera del país.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Perfil del Solicitante</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-bold uppercase text-gray-500">Nombre Completo</Label>
                <Input id="full_name" defaultValue={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : ''} placeholder="Ej: Juan Pérez García" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_card" className="text-xs font-bold uppercase text-gray-500">Carné de Identidad</Label>
                <Input id="id_card" placeholder="11 dígitos" maxLength={11} className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-500">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} placeholder="usuario@uho.edu.cu" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase text-gray-500">Teléfono de Contacto</Label>
                <Input id="phone" placeholder="+53 5XXXXXXX" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <GraduationCap className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles de Postgrado</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="academic_program" className="text-xs font-bold uppercase text-gray-500">Tipo de Programa</Label>
                <Select>
                  <SelectTrigger id="academic_program" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {academicPrograms.map(prog => (
                      <SelectItem key={prog.value} value={prog.value}>{prog.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="career" className="text-xs font-bold uppercase text-gray-500">Nombre del Programa / Maestría</Label>
                <Input id="career" placeholder="Ej: Maestría en Ciencias de la Computación" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="document_type" className="text-xs font-bold uppercase text-gray-500">Documento Solicitado</Label>
                <Select>
                  <SelectTrigger id="document_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-xs font-bold uppercase text-gray-500">Año de Graduación</Label>
                <Select>
                  <SelectTrigger id="year" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="----" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest" className="text-xs font-bold uppercase text-gray-500">Tipo de Interés</Label>
                <Select defaultValue="ESTATAL">
                  <SelectTrigger id="interest" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESTATAL">Estatal</SelectItem>
                    <SelectItem value="PARTICULAR">Particular / No Estatal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file" className="text-xs font-bold uppercase text-gray-500">Adjuntar Título Escaneado (Requerido para Internacional)</Label>
              <div className="relative group">
                <Input id="file" type="file" className="hidden" />
                <label htmlFor="file" className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-secondary-lime transition-all">
                  <CloudUpload className="w-8 h-8 text-primary-navy mb-1" />
                  <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Seleccionar Archivo</span>
                  <span className="text-xs text-gray-400 font-medium">PDF, JPG o PNG (Máx 5MB)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-400 font-medium max-w-xs italic text-center md:text-left">
              * Las certificaciones internacionales requieren validación previa del Ministerio de Educación Superior.
            </p>
            <Button className="w-full md:w-auto bg-primary-navy hover:bg-primary-navy/90 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary-navy/20 active:scale-95 transition-all">
              Procesar Trámite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
