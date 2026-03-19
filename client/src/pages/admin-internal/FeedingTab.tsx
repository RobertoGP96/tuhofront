import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { internalAdminService } from '@/services/internal-admin.service';
import type { AdminFeedingProcedure, InternalProcedureState } from '@/types/internal.types';
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
import type { AdminBaseProcedure } from '@/types/internal.types';

const FEEDING_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurante',
  HOTELITO: 'Hotelito',
};

export function FeedingTab() {
  const [items, setItems] = useState<AdminFeedingProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [managing, setManaging] = useState<AdminFeedingProcedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (stateFilter !== 'ALL') params.state = stateFilter;
      const data = await internalAdminService.getFeedingProcedures(params);
      setItems(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch {
      toast.error('Error al cargar los trámites de alimentación.');
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

  function handleManage(item: AdminFeedingProcedure) {
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
            <TableHead>Cantidad</TableHead>
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
                  {FEEDING_TYPE_LABELS[item.feeding_type] ?? item.feeding_type}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {item.start_day} — {item.end_day}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{item.amount}</TableCell>
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
        procedureType="feeding"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
        renderDetails={(proc) => {
          const f = proc as AdminFeedingProcedure;
          return (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Tipo</span>
                <p className="text-primary-navy">
                  {FEEDING_TYPE_LABELS[f.feeding_type] ?? f.feeding_type}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Cantidad</span>
                <p className="text-primary-navy">{f.amount}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Periodo</span>
                <p className="text-primary-navy">
                  {f.start_day} — {f.end_day}
                </p>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
