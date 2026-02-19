import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export const TitleLegalization = () => {
  const [date, setDate] = useState<Date>();

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm border-gray-100">
      <CardHeader className="border-b border-gray-50 bg-gray-50/50">
        <CardTitle className="text-xl font-bold text-primary-navy uppercase">
          Legalización de Título
        </CardTitle>
        <CardDescription>
          Complete los datos para la legalización de su título profesional.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo</Label>
            <Input id="nombreCompleto" placeholder="Ingrese su nombre completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoTitulo">Tipo de Título</Label>
            <Select>
              <SelectTrigger id="tipoTitulo" className="w-full">
                <SelectValue placeholder="Selecciona el tipo de título" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pregrado_nacional">Pregrado Nacional</SelectItem>
                <SelectItem value="pregrado_internacional">Pregrado Internacional</SelectItem>
                <SelectItem value="postgrado_nacional">Postgrado Nacional</SelectItem>
                <SelectItem value="postgrado_internacional">Postgrado Internacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="numeroTitulo">Número de Título</Label>
            <Input id="numeroTitulo" placeholder="Ej: 12345" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaExpedicion">Fecha de Expedición</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Seleccione fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paisDestino">País de Destino</Label>
            <Input id="paisDestino" placeholder="Ej: España" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button className="bg-primary-navy hover:bg-primary-navy/90 text-white px-8">
            Solicitar Legalización
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
