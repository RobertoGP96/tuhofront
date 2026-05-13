import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proceduresService } from '../services/procedures.service';
import { reportsService } from '../services/reports.service';
import type { Procedure, ProcedureState } from '../types/procedures.types';
import { ExportReportButton } from '@/components/reports/ExportReportButton';

const STATE_LABELS: Record<ProcedureState, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  EN_PROCESO: 'En Proceso',
  REQUIERE_INFO: 'Requiere Info',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

const STATE_COLORS: Record<ProcedureState, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REQUIERE_INFO: 'bg-orange-100 text-orange-700 border-orange-200',
  APROBADO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-red-100 text-red-700 border-red-200',
  FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PAGE_SIZE = 20;

function StateBadge({ state }: { state: ProcedureState }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATE_COLORS[state])}>
      {STATE_LABELS[state]}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ShadcnTableRow key={i}>
          <ShadcnTableCell><Skeleton className="h-4 w-32" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-24" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-6 w-28 rounded-full" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-24" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-8 w-8 rounded" /></ShadcnTableCell>
        </ShadcnTableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <ShadcnTableRow>
      <ShadcnTableCell colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <FileText size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">No se encontraron tramites</p>
          <p className="text-xs">Intente cambiar el filtro o realice una nueva solicitud.</p>
        </div>
      </ShadcnTableCell>
    </ShadcnTableRow>
  );
}

export default function MyProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchProcedures() {
      setIsLoading(true);
      setError(null);

      try {
        const params: { state?: string; page?: number } = { page };
        if (stateFilter !== 'ALL') {
          params.state = stateFilter;
        }

        const data = await proceduresService.getProcedures(params);

        if (!cancelled) {
          setProcedures(data.results);
          setTotalCount(data.count);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar la lista de tramites. Intente de nuevo.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProcedures();

    return () => {
      cancelled = true;
    };
  }, [stateFilter, page]);

  function handleStateChange(value: string) {
    setStateFilter(value);
    setPage(1);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Mis Tramites</h1>
          <p className="text-gray-500">Consulte el estado de sus solicitudes y procedimientos.</p>
        </div>
        <ExportReportButton
          label="Exportar mi historial"
          onExport={(filters) => reportsService.downloadMyHistory(filters)}
        />
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Listado de Tramites</CardTitle>
              <CardDescription>Visualice y siga el estado de cada solicitud.</CardDescription>
            </div>
            <Select value={stateFilter} onValueChange={handleStateChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                {(Object.keys(STATE_LABELS) as ProcedureState[]).map((state) => (
                  <SelectItem key={state} value={state}>
                    {STATE_LABELS[state]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow className="hover:bg-transparent">
                <ShadcnTableHead className="w-[180px]"># Seguimiento</ShadcnTableHead>
                <ShadcnTableHead>Tipo</ShadcnTableHead>
                <ShadcnTableHead>Estado</ShadcnTableHead>
                <ShadcnTableHead>Fecha</ShadcnTableHead>
                <ShadcnTableHead className="text-right">Acciones</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : procedures.length === 0 ? (
                <EmptyState />
              ) : (
                procedures.map((proc) => (
                  <ShadcnTableRow key={proc.id} className="group">
                    <ShadcnTableCell className="font-mono text-sm font-medium text-gray-600">
                      {proc.follow_number}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-gray-500 text-sm">
                      Tramite
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <StateBadge state={proc.state} />
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-gray-500 text-sm">
                      {formatDate(proc.created_at)}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link to={`/procedures/${proc.id}`}>
                            <Eye size={16} />
                            <span className="sr-only">Ver tramite</span>
                          </Link>
                        </Button>
                      </div>
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ))
              )}
            </ShadcnTableBody>
          </ShadcnTable>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {totalCount} resultado{totalCount !== 1 ? 's' : ''} en total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span>
                  Pagina {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
