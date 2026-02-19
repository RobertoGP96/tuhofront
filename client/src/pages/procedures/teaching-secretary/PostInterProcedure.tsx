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

export const PostInterProcedure = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm border-gray-100">
      <CardHeader className="border-b border-gray-50 bg-gray-50/50">
        <CardTitle className="text-xl font-bold text-primary-navy uppercase">
          Datos de Solicitud - Título Internacional de Postgrado
        </CardTitle>
        <CardDescription>
          Complete la información requerida para solicitar su título internacional de postgrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tipoEstudio">Tipo de Estudio</Label>
            <Input id="tipoEstudio" disabled value="Postgrado" className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoUso">Tipo de Uso</Label>
            <Input id="tipoUso" disabled value="Internacional" className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoTramite">Tipo de Trámite</Label>
            <Select>
              <SelectTrigger id="tipoTramite" className="w-full">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitud">Solicitud de Título</SelectItem>
                <SelectItem value="duplicado">Duplicado de Título</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionario</Label>
            <Input id="funcionario" placeholder="Nombre del funcionario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="programa">Programa de Postgrado</Label>
            <Input id="programa" placeholder="Nombre del programa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anio">Año de Graduación</Label>
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
