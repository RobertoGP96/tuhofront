import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { internalAdminService } from '@/services/internal-admin.service';
import type {
  AdminMaintenanceProcedure,
  AdminBaseProcedure,
  InternalProcedureState,
  MaintanceProcedureType,
  MaintancePriority,
} from '@/types/internal.types';
import { PAGE_SIZE, formatDate } from './constants';
import {
  StateBadge,
  StateFilter,
  TableSkeletonRows,
  ManageBtn,
  Pagination,
  EmptyRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ProcedureTableShared';
import { ManageInternalProcedureDialog } from './ManageInternalProcedureDialog';

function getTypeName(val: number | MaintanceProcedureType | undefined): string {
  if (!val) return '—';
  if (typeof val === 'object') return val.name;
  return String(val);
}

function getPriorityName(val: number | MaintancePriority | undefined): string {
  if (!val) return '—';
  if (typeof val === 'object') return val.name;
  return String(val);
}

export function MaintenanceTab() {
  const [items, setItems] = useState<AdminMaintenanceProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [managing, setManaging] = useState<AdminMaintenanceProcedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (stateFilter !== 'ALL') params.state = stateFilter;
      const data = await internalAdminService.getMaintenanceProcedures(params);
      setItems(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch {
      toast.error('Error al cargar los trámites de mantenimiento.');
    } finally {
      setIsLoading(false);
    }
  }, [page, stateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleStateChange(val: InternalProcedureState | 'ALL') {
    setStateFilter(val);
    setPage(1);
  }

  function handleManage(item: AdminMaintenanceProcedure) {
    setManaging(item);
    setDialogOpen(true);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {isLoading ? 'Cargando...' : `${total} trámite${total !== 1 ? 's' : ''}`}
        </p>
        <StateFilter value={stateFilter} onChange={handleStateChange} />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Solicitante</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Descripcion</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={6} />
          ) : items.length === 0 ? (
            <EmptyRow colSpan={7} />
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-700">{item.username}</TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {getTypeName(item.procedure_type)}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {getPriorityName(item.priority)}
                </TableCell>
                <TableCell className="text-gray-500 text-sm max-w-[200px] truncate">
                  {item.description}
                </TableCell>
                <TableCell>
                  <StateBadge state={item.state} />
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <ManageBtn onClick={() => handleManage(item)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onNext={() => setPage((p) => p + 1)}
        onPrevious={() => setPage((p) => p - 1)}
      />

      <ManageInternalProcedureDialog
        procedure={managing as AdminBaseProcedure | null}
        procedureType="maintenance"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
        renderDetails={(proc) => {
          const m = proc as AdminMaintenanceProcedure;
          return (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Tipo</span>
                <p className="text-primary-navy">{getTypeName(m.procedure_type)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Prioridad</span>
                <p className="text-primary-navy">{getPriorityName(m.priority)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Descripcion</span>
                <p className="text-primary-navy">{m.description}</p>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
