import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { internalAdminService } from '@/services/internal-admin.service';
import type {
  AdminTransportProcedure,
  AdminBaseProcedure,
  InternalProcedureState,
  TransportProcedureType,
} from '@/types/internal.types';
import { PAGE_SIZE, formatDate, formatDateTime } from './constants';
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

function getProcedureTypeName(pt: number | TransportProcedureType | undefined): string {
  if (!pt) return '—';
  if (typeof pt === 'object') return pt.name;
  return String(pt);
}

export function TransportTab() {
  const [items, setItems] = useState<AdminTransportProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [managing, setManaging] = useState<AdminTransportProcedure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (stateFilter !== 'ALL') params.state = stateFilter;
      const data = await internalAdminService.getTransportProcedures(params);
      setItems(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } catch {
      toast.error('Error al cargar los trámites de transporte.');
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

  function handleManage(item: AdminTransportProcedure) {
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
            <TableHead>Origen</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Pasajeros</TableHead>
            <TableHead>Ida y vuelta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={7} />
          ) : items.length === 0 ? (
            <EmptyRow colSpan={8} />
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-700">{item.username}</TableCell>
                <TableCell className="text-gray-600 text-sm">{item.departure_place}</TableCell>
                <TableCell className="text-gray-600 text-sm">{item.return_place}</TableCell>
                <TableCell className="text-gray-500 text-sm">{item.passengers}</TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {item.round_trip ? 'Sí' : 'No'}
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
        procedureType="transport"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
        renderDetails={(proc) => {
          const t = proc as AdminTransportProcedure;
          return (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Tipo</span>
                <p className="text-primary-navy">{getProcedureTypeName(t.procedure_type)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Pasajeros</span>
                <p className="text-primary-navy">{t.passengers}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Origen</span>
                <p className="text-primary-navy">{t.departure_place}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Destino</span>
                <p className="text-primary-navy">{t.return_place}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Salida</span>
                <p className="text-primary-navy">{formatDateTime(t.departure_time)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Retorno</span>
                <p className="text-primary-navy">{formatDateTime(t.return_time)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Ida y vuelta</span>
                <p className="text-primary-navy">{t.round_trip ? 'Sí' : 'No'}</p>
              </div>
              {t.plate && (
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-400">Placa</span>
                  <p className="text-primary-navy">{t.plate}</p>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
