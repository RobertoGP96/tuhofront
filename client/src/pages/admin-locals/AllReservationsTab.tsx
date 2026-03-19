import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { localsService } from '@/services/locals.service';
import type { ReservationListItem, ReservationState } from '@/types/locals.types';
import { ReservationBadge } from './ReservationBadge';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-7 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface DetailDialogProps {
  open: boolean;
  reservation: ReservationListItem | null;
  onClose: () => void;
}

function DetailDialog({ open, reservation, onClose }: DetailDialogProps) {
  if (!reservation) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de Reserva</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">N Seguimiento</span>
            <span className="font-mono font-medium">{reservation.numero_seguimiento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Local</span>
            <span className="font-medium">{reservation.local_name} ({reservation.local_code})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Solicitante</span>
            <span>{reservation.user_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Responsable</span>
            <span>{reservation.responsible_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Inicio</span>
            <span>{formatDateTime(reservation.start_time)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fin</span>
            <span>{formatDateTime(reservation.end_time)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duracion</span>
            <span>{reservation.duration_hours}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Proposito</span>
            <span>{reservation.purpose_display}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Asistentes</span>
            <span>{reservation.expected_attendees}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Estado</span>
            <ReservationBadge state={reservation.state} />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Creado</span>
            <span>{formatDateTime(reservation.created_at)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ALL_STATES: ReservationState[] = [
  'BORRADOR',
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
  'CANCELADA',
  'EN_CURSO',
  'FINALIZADA',
];

const STATE_LABELS: Record<ReservationState, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  EN_CURSO: 'En Curso',
  FINALIZADA: 'Finalizada',
};

export function AllReservationsTab() {
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<ReservationState | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ReservationListItem | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (stateFilter !== 'all') params.state = stateFilter;
      const data = await localsService.getReservations(params as Parameters<typeof localsService.getReservations>[0]);
      setReservations(data.results);
      setHasNext(data.next !== null);
    } catch {
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, [stateFilter, page]);

  useEffect(() => {
    void fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    setPage(1);
  }, [stateFilter]);

  const openDetail = (res: ReservationListItem) => {
    setDetailItem(res);
    setDetailOpen(true);
  };

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary-navy">Todas las Reservas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={stateFilter}
            onValueChange={(v) => setStateFilter(v as ReservationState | 'all')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {ALL_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Local</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Proposito</TableHead>
              <TableHead className="w-28">Estado</TableHead>
              <TableHead className="text-right w-16">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  No hay reservas.
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((res) => (
                <TableRow key={res.id} className="group">
                  <TableCell>
                    <div className="font-medium text-gray-800">{res.local_name}</div>
                    <div className="text-xs text-gray-400 font-mono">{res.local_code}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{res.user_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(res.start_time)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{res.purpose_display}</TableCell>
                  <TableCell>
                    <ReservationBadge state={res.state} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ver detalle"
                      onClick={() => openDetail(res)}
                    >
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-500">Pagina {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </CardContent>

      <DetailDialog
        open={detailOpen}
        reservation={detailItem}
        onClose={() => { setDetailOpen(false); setDetailItem(null); }}
      />
    </Card>
  );
}
