import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { internalAdminService } from '@/services/internal-admin.service';
import type { AdminAccommodationProcedure, AdminBaseProcedure, InternalProcedureState } from '@/types/internal.types';
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

const ACCOMMODATION_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hotel',
  POSGRADO: 'Posgrado',
};

export function AccommodationTab() {
  const [items, setItems] = useState<AdminAccommodationProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [managing, setManaging] = useState<AdminAccommodationProcedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (stateFilter !== 'ALL') params.state = stateFilter;
      const data = await internalAdminService.getAccommodationProcedures(params);
      setItems(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch {
      toast.error('Error al cargar los trámites de hospedaje.');
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

  function handleManage(item: AdminAccommodationProcedure) {
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
            <TableHead>Periodo</TableHead>
            <TableHead>Huespedes</TableHead>
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
                  {ACCOMMODATION_TYPE_LABELS[item.accommodation_type] ?? item.accommodation_type}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {item.start_day} — {item.end_day}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {Array.isArray(item.guests) ? item.guests.length : '—'}
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
        procedureType="accommodation"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
        renderDetails={(proc) => {
          const a = proc as AdminAccommodationProcedure;
          return (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Tipo</span>
                <p className="text-primary-navy">
                  {ACCOMMODATION_TYPE_LABELS[a.accommodation_type] ?? a.accommodation_type}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Huespedes</span>
                <p className="text-primary-navy">
                  {Array.isArray(a.guests) ? a.guests.length : '—'}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Periodo</span>
                <p className="text-primary-navy">
                  {a.start_day} — {a.end_day}
                </p>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
