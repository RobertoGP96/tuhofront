import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from '@/components/ui/table';
import { secretaryAdminService } from '../services/secretary-admin.service';
import { reportsService } from '../services/reports.service';
import type { SecretaryDocProcedure } from '../types/secretary-doc.types';
import { STATE_LABELS, VALID_TRANSITIONS } from '@/lib/constants';
import { StateBadge } from '@/components/StateBadge';
import { ExportReportButton } from '@/components/reports/ExportReportButton';

// ---- Constants ----

const STATE_LABELS_WITH_ALL: Record<string, string> = {
  ALL: 'Todos los estados',
  ...STATE_LABELS,
};

const STUDY_TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'PREGRADO', label: 'Pregrado' },
  { value: 'POSGRADO', label: 'Posgrado' },
];

const VISIBILITY_OPTIONS = [
  { value: 'ALL', label: 'Nacional e Internacional' },
  { value: 'NACIONAL', label: 'Nacional' },
  { value: 'INTERNACIONAL', label: 'Internacional' },
];

const ALL_STATES = Object.keys(STATE_LABELS_WITH_ALL).filter((k) => k !== 'ALL');

const PAGE_SIZE = 20;

// ---- Helpers ----

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getProcedureTypeLabel(proc: SecretaryDocProcedure): string {
  const study = proc.study_type === 'PREGRADO' ? 'Pregrado' : 'Posgrado';
  const vis = proc.visibility_type === 'NACIONAL' ? 'Nacional' : 'Internacional';
  return `${study} ${vis}`;
}

// ---- Sub-components ----

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <ShadcnTableRow key={i}>
          <ShadcnTableCell className="pl-6"><Skeleton className="h-4 w-32" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-20" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-28" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-6 w-24 rounded-full" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-20" /></ShadcnTableCell>
          <ShadcnTableCell className="pr-6"><Skeleton className="h-8 w-20 ml-auto" /></ShadcnTableCell>
        </ShadcnTableRow>
      ))}
    </>
  );
}

// ---- Manage Dialog ----

interface ManageDialogProps {
  procedure: SecretaryDocProcedure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ManageSecretaryDialog({
  procedure,
  open,
  onOpenChange,
  onSuccess,
}: ManageDialogProps) {
  const [selectedState, setSelectedState] = useState('');
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = procedure
    ? (VALID_TRANSITIONS[procedure.state] ?? [])
    : [];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedState('');
      setObservation('');
    }
    onOpenChange(nextOpen);
  }

  async function handleSave() {
    if (!procedure) return;
    setIsSubmitting(true);
    try {
      if (selectedState) {
        await secretaryAdminService.changeState(procedure.id as unknown as number, {
          estado: selectedState,
          observaciones: observation.trim() || undefined,
        });
      }
      toast.success('Trámite actualizado correctamente.');
      onSuccess();
      handleOpenChange(false);
    } catch {
      toast.error('Error al actualizar el trámite. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!procedure) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Tramite</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">Solicitante</span>
              <p className="font-medium text-primary-navy">{procedure.full_name}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">CI</span>
              <p className="font-mono font-medium text-primary-navy">{procedure.id_card}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">Tipo</span>
              <p className="font-medium text-primary-navy">{getProcedureTypeLabel(procedure)}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">Estado actual</span>
              <p className="font-medium text-primary-navy">
                {STATE_LABELS[procedure.state] ?? procedure.state}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Carrera</span>
              <p className="font-medium text-primary-navy">{procedure.career}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Cambiar estado</label>
            {availableTransitions.length > 0 ? (
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo estado..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((state) => (
                    <SelectItem key={state} value={state}>
                      {STATE_LABELS[state] ?? state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-400">
                No hay transiciones disponibles para este estado.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <Textarea
              placeholder="Escriba una observación..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !selectedState}
            className="bg-primary-navy hover:bg-primary-navy/90 text-white"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Page ----

export default function SecretaryProcedures() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [procedures, setProcedures] = useState<SecretaryDocProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [studyTypeFilter, setStudyTypeFilter] = useState(
    searchParams.get('study_type') ?? 'ALL',
  );
  const [visibilityFilter, setVisibilityFilter] = useState(
    searchParams.get('visibility_type') ?? 'ALL',
  );
  const [stateFilter, setStateFilter] = useState('ALL');

  const [managingProcedure, setManagingProcedure] = useState<SecretaryDocProcedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setPage(1), 0);
    };
  }

  const fetchProcedures = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: PAGE_SIZE,
        ordering: '-created_at',
      };
      if (studyTypeFilter !== 'ALL') params.study_type = studyTypeFilter;
      if (visibilityFilter !== 'ALL') params.visibility_type = visibilityFilter;
      if (stateFilter !== 'ALL') params.state = stateFilter;

      const data = await secretaryAdminService.getProcedures(params);
      setProcedures(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null && data.next !== undefined);
      setHasPrevious(data.previous !== null && data.previous !== undefined);
    } catch {
      toast.error('Error al cargar los trámites.');
    } finally {
      setIsLoading(false);
    }
  }, [page, studyTypeFilter, visibilityFilter, stateFilter]);

  useEffect(() => {
    fetchProcedures();
  }, [fetchProcedures]);

  function handleManage(proc: SecretaryDocProcedure) {
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
            {isLoading
              ? 'Cargando...'
              : `${total} tramite${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <ExportReportButton
          label="Exportar PDF"
          onExport={(filters) => reportsService.downloadSecretary(filters)}
        />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Select value={studyTypeFilter} onValueChange={handleFilterChange(setStudyTypeFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Tipo de estudio" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={handleFilterChange(setVisibilityFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Visibilidad" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stateFilter} onValueChange={handleFilterChange(setStateFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{STATE_LABELS_WITH_ALL.ALL}</SelectItem>
            {ALL_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {STATE_LABELS_WITH_ALL[state]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText size={18} className="text-primary-navy" />
            Listado de Tramites
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow className="hover:bg-transparent">
                <ShadcnTableHead className="pl-6">Solicitante</ShadcnTableHead>
                <ShadcnTableHead>CI</ShadcnTableHead>
                <ShadcnTableHead>Tipo</ShadcnTableHead>
                <ShadcnTableHead>Estado</ShadcnTableHead>
                <ShadcnTableHead>Fecha</ShadcnTableHead>
                <ShadcnTableHead className="text-right pr-6">Acciones</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : procedures.length === 0 ? (
                <ShadcnTableRow>
                  <ShadcnTableCell
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    No se encontraron tramites.
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : (
                procedures.map((proc) => (
                  <ShadcnTableRow
                    key={proc.id}
                    className="group cursor-pointer hover:bg-gray-50/80"
                    onClick={() => navigate(`/secretary/procedures/${proc.id}`)}
                  >
                    <ShadcnTableCell className="pl-6 font-medium text-gray-800">
                      {proc.full_name}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-sm text-gray-500 font-mono">
                      {proc.id_card}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-sm text-gray-600">
                      {getProcedureTypeLabel(proc)}
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <StateBadge state={proc.state} />
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-sm text-gray-500">
                      {formatDate(proc.created_at)}
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-primary-navy hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); handleManage(proc); }}
                      >
                        <Settings size={14} />
                        Gestionar
                      </Button>
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
            Pagina {page} de {totalPages}
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

      <ManageSecretaryDialog
        procedure={managingProcedure}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProcedures}
      />
    </div>
  );
}
