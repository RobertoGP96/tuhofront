
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
import { Briefcase, CloudUpload, Globe, User } from "lucide-react";

export const UnderInterProcedure = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const documentTypes = [
    { value: 'Índice Académico', label: 'Índice Académico' },
    { value: 'Certificación de Notas', label: 'Certificación de Notas' },
    { value: 'Certifico de Estudios Terminados', label: 'Certifico de Estudios Terminados' },
    { value: 'Copia Literal del Título', label: 'Copia Literal del Título' },
    { value: 'Plan de Estudio', label: 'Plan de Estudio' },
    { value: 'Plan Temático', label: 'Plan Temático' },
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
                Solicitud Pregrado <span className="text-secondary-lime">Internacional</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Documentación académica de pregrado para uso en el extranjero (Legalización MES/Minrex).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Identidad</h3>
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
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Briefcase className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Título</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="document_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Documento</Label>
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="career" className="text-xs font-bold uppercase text-gray-500">Carrera de Graduación</Label>
                <Input id="career" placeholder="Nombre completo de la carrera" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs font-bold uppercase text-gray-500">Copia del Título</Label>
                <div className="relative group">
                  <Input id="file" type="file" className="hidden" />
                  <label htmlFor="file" className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-primary-navy/30 transition-all text-sm text-gray-500 font-medium">
                    <CloudUpload className="w-4 h-4 text-primary-navy" />
                    Adjuntar Archivo
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-400 font-medium max-w-xs italic text-center md:text-left">
              * Los trámites internacionales pueden requerir el pago de tasas adicionales en sellos del timbre.
            </p>
            <Button className="w-full md:w-auto bg-primary-navy hover:bg-primary-navy/90 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary-navy/20 active:scale-95 transition-all">
              Siguiente Paso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
