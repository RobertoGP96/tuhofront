
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
import { BookOpen, CloudUpload, FileCheck, Fingerprint, User } from "lucide-react";

export const TitleLegalization = () => {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
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
          {/* Identity Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Identificación del Solicitante</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-bold uppercase text-gray-500">Nombre Completo</Label>
                <Input id="full_name" defaultValue={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : ''} placeholder="Nombre completo" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_card" className="text-xs font-bold uppercase text-gray-500">Carné de Identidad</Label>
                <Input id="id_card" placeholder="Número de carné" maxLength={11} className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>
          </div>

          {/* Registry Info (Specific for Legalization) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <BookOpen className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Datos del Registro</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="registry_volume" className="text-xs font-bold uppercase text-gray-500">Tomo</Label>
                <Input id="registry_volume" placeholder="Ej: 45" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folio" className="text-xs font-bold uppercase text-gray-500">Folio</Label>
                <Input id="folio" placeholder="Ej: 12" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number" className="text-xs font-bold uppercase text-gray-500">Número</Label>
                <Input id="number" placeholder="Ej: 301" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="study_type" className="text-xs font-bold uppercase text-gray-500">Nivel de Estudio</Label>
                <Select>
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
                <Label htmlFor="career" className="text-xs font-bold uppercase text-gray-500">Carrera / Programa</Label>
                <Input id="career" placeholder="Nombre completo" className="rounded-xl border-gray-100 bg-gray-50/50" />
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Fingerprint className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Verificación y Soporte</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file" className="text-xs font-bold uppercase text-gray-500">Copia del Título (Escaneado)</Label>
              <div className="relative group">
                <Input id="file" type="file" className="hidden" />
                <label htmlFor="file" className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-secondary-lime transition-all">
                  <CloudUpload className="w-8 h-8 text-primary-navy mb-1" />
                  <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Seleccionar Archivo</span>
                  <span className="text-xs text-gray-400 font-medium">Formato PDF altamente recomendado</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-400 font-medium max-w-sm italic text-center md:text-left">
              * La legalización de título es un trámite presencial para la entrega del documento físico original, esta solicitud digital inicia el proceso de verificación interna.
            </p>
            <Button className="w-full md:w-auto bg-primary-navy hover:bg-primary-navy/90 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary-navy/20 active:scale-95 transition-all">
              Solicitar Legalización
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
