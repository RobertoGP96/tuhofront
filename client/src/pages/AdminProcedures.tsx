import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table as ShadcnTable,
    TableBody as ShadcnTableBody,
    TableCell as ShadcnTableCell,
    TableHead as ShadcnTableHead,
    TableHeader as ShadcnTableHeader,
    TableRow as ShadcnTableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";

interface Procedure {
  id: string;
  name: string;
  student: string;
  date: string;
  status: "Pendiente" | "En proceso" | "Completado";
}

const procedures: Procedure[] = [
  {
    id: "1",
    name: "Solicitud de título",
    student: "Juan Pérez",
    date: "2025-01-20",
    status: "Pendiente",
  },
  {
    id: "2",
    name: "Legalización de título",
    student: "Ana García",
    date: "2025-01-19",
    status: "En proceso",
  },
  {
    id: "3",
    name: "Certificación de notas",
    student: "Carlos López",
    date: "2025-01-18",
    status: "Completado",
  },
];

export const ProceduresManagement = () => {
  const getStatusColor = (status: Procedure["status"]) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completado":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Gestión de Trámites</h1>
          <p className="text-gray-500">Administre las solicitudes de la Secretaría Docente.</p>
        </div>
        <Button className="bg-primary-navy hover:bg-primary-navy/90 text-white gap-2">
          <Plus size={18} /> Nuevo Trámite
        </Button>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Listado de Trámites</CardTitle>
          <CardDescription>Visualice y gestione el estado de cada solicitud.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow className="hover:bg-transparent">
                <ShadcnTableHead className="w-[80px]">ID</ShadcnTableHead>
                <ShadcnTableHead>Nombre del Trámite</ShadcnTableHead>
                <ShadcnTableHead>Estudiante</ShadcnTableHead>
                <ShadcnTableHead>Fecha</ShadcnTableHead>
                <ShadcnTableHead>Estado</ShadcnTableHead>
                <ShadcnTableHead className="text-right">Acciones</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {procedures.map((proc) => (
                <ShadcnTableRow key={proc.id} className="group">
                  <ShadcnTableCell className="font-medium text-gray-400">#{proc.id}</ShadcnTableCell>
                  <ShadcnTableCell className="font-semibold text-primary-navy">{proc.name}</ShadcnTableCell>
                  <ShadcnTableCell>{proc.student}</ShadcnTableCell>
                  <ShadcnTableCell className="text-gray-500">{proc.date}</ShadcnTableCell>
                  <ShadcnTableCell>
                    <Badge variant="outline" className={cn("font-medium", getStatusColor(proc.status))}>
                      {proc.status}
                    </Badge>
                  </ShadcnTableCell>
                  <ShadcnTableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ))}
            </ShadcnTableBody>
          </ShadcnTable>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProceduresManagement;
