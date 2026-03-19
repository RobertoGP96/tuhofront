import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Eye, FileText, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { ManageProcedureDialog } from '@/components/ManageProcedureDialog';
import { proceduresService } from '@/services/procedures.service';
import type { Procedure, ProcedureState } from '@/types/procedures.types';

const STATE_LABELS: Record<ProcedureState | 'ALL', string> = {
  ALL: 'Todos los estados',
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  EN_PROCESO: 'En Proceso',
  REQUIERE_INFO: 'Requiere Información',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

const STATE_BADGE_CLASSES: Record<ProcedureState, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  REQUIERE_INFO: 'bg-orange-100 text-orange-700 border-orange-200',
  APROBADO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-red-100 text-red-700 border-red-200',
  FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PAGE_SIZE = 20;

const ALL_STATES = Object.keys(STATE_LABELS).filter(
  (k) => k !== 'ALL',
) as ProcedureState[];

function getUserName(proc: Procedure): string {
  const full = `${proc.user.first_name} ${proc.user.last_name}`.trim();
  return full || proc.user.username;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export const ProceduresManagement = () => {
  const navigate = useNavigate();

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stateFilter, setStateFilter] = useState<ProcedureState | 'ALL'>('ALL');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [managingProcedure, setManagingProcedure] = useState<Procedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  }

  function handleStateChange(value: string) {
    setStateFilter(value as ProcedureState | 'ALL');
    setPage(1);
  }

  const fetchProcedures = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (stateFilter !== 'ALL') params.state = stateFilter;
      if (debouncedSearch.trim()) params.follow_number = debouncedSearch.trim();

      const data = await proceduresService.getProcedures(params);
      setProcedures(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch {
      toast.error('Error al cargar los trámites.');
    } finally {
      setIsLoading(false);
    }
  }, [page, stateFilter, debouncedSearch]);

  useEffect(() => {
    fetchProcedures();
  }, [fetchProcedures]);

  function handleManage(proc: Procedure) {
    setManagingProcedure(proc);
    setDialogOpen(true);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Gestion de Tramites</h1>
          <p className="text-gray-500">
            {isLoading ? 'Cargando...' : `${total} trámite${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={stateFilter} onValueChange={handleStateChange}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{STATE_LABELS.ALL}</SelectItem>
            {ALL_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {STATE_LABELS[state]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar por # de seguimiento..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText size={18} className="text-primary-navy" />
            Listado de Trámites
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow className="hover:bg-transparent">
                <ShadcnTableHead className="pl-6"># Seguimiento</ShadcnTableHead>
                <ShadcnTableHead>Solicitante</ShadcnTableHead>
                <ShadcnTableHead>Estado</ShadcnTableHead>
                <ShadcnTableHead>Fecha</ShadcnTableHead>
                <ShadcnTableHead className="text-right pr-6">Acciones</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ShadcnTableRow key={i}>
                    <ShadcnTableCell className="pl-6">
                      <Skeleton className="h-4 w-28" />
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <Skeleton className="h-4 w-36" />
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <Skeleton className="h-4 w-20" />
                    </ShadcnTableCell>
                    <ShadcnTableCell className="pr-6">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ))
              ) : procedures.length === 0 ? (
                <ShadcnTableRow>
                  <ShadcnTableCell
                    colSpan={5}
                    className="py-12 text-center text-gray-400"
                  >
                    No se encontraron trámites.
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : (
                procedures.map((proc) => (
                  <ShadcnTableRow key={proc.id} className="group">
                    <ShadcnTableCell className="pl-6 font-mono text-sm font-semibold text-primary-navy">
                      {proc.follow_number}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-gray-700">
                      {getUserName(proc)}
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <Badge
                        variant="outline"
                        className={cn('font-medium', STATE_BADGE_CLASSES[proc.state])}
                      >
                        {STATE_LABELS[proc.state]}
                      </Badge>
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-gray-500 text-sm">
                      {formatDate(proc.created_at)}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Ver trámite"
                          onClick={() => navigate(`/procedures/${proc.id}`)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary-navy hover:bg-blue-50"
                          title="Gestionar trámite"
                          onClick={() => handleManage(proc)}
                        >
                          <Settings size={16} />
                        </Button>
                      </div>
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ))
              )}
            </ShadcnTableBody>
          </ShadcnTable>
        </CardContent>
      </Card>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
              className="gap-1"
            >
              <ChevronLeft size={14} /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="gap-1"
            >
              Siguiente <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <ManageProcedureDialog
        procedure={managingProcedure}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProcedures}
      />
    </div>
  );
};

export default ProceduresManagement;
