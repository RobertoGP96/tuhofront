import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const UnderInterProcedure = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm border-gray-100">
      <CardHeader className="border-b border-gray-50 bg-gray-50/50">
        <CardTitle className="text-xl font-bold text-primary-navy uppercase">
          Datos de Solicitud - Título Internacional de Pregrado
        </CardTitle>
        <CardDescription>
          Complete la información requerida para solicitar su título internacional de pregrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tipoEstudio">Tipo de Estudio</Label>
            <Input id="tipoEstudio" disabled value="Pregrado" className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoUso">Tipo de Uso</Label>
            <Input id="tipoUso" disabled value="Internacional" className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoTramite">Tipo de Trámite</Label>
            <Select>
              <SelectTrigger id="tipoTramite" className="w-full">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitud">Solicitud</SelectItem>
                <SelectItem value="duplicado">Duplicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Interés</Label>
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="estatal" defaultChecked />
                <Label htmlFor="estatal" className="text-sm font-normal cursor-pointer">Estatal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="particular" />
                <Label htmlFor="particular" className="text-sm font-normal cursor-pointer">Particular</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionario</Label>
            <Input id="funcionario" placeholder="Nombre del funcionario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carrera">Carrera</Label>
            <Input id="carrera" placeholder="Nombre de la carrera" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anio">Año</Label>
            <Select>
              <SelectTrigger id="anio" className="w-full">
                <SelectValue placeholder="----" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button className="bg-primary-navy hover:bg-primary-navy/90 text-white px-8">
            Continuar Solicitud
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
