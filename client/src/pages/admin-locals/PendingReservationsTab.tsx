import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { localsService } from '@/services/locals.service';
import type { ReservationListItem } from '@/types/locals.types';

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
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-7 w-24 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface RejectDialogProps {
  open: boolean;
  reservationId: number | null;
  onClose: () => void;
  onConfirm: (id: number, reason: string) => Promise<void>;
}

function RejectDialog({ open, reservationId, onClose, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReason('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reservationId === null) return;
    setSaving(true);
    try {
      await onConfirm(reservationId, reason.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rechazar Reserva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="rejection-reason">Motivo de rechazo</Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Indique el motivo del rechazo..."
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={saving || !reason.trim()}>
              {saving ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PendingReservationsTabProps {
  refreshKey?: number;
}

export function PendingReservationsTab({ refreshKey }: PendingReservationsTabProps) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await localsService.getPendingReservations();
      setReservations(data);
    } catch {
      toast.error('Error al cargar las reservas pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPending();
  }, [fetchPending, refreshKey]);

  const handleApprove = async (id: number) => {
    try {
      await localsService.approveReservation(id, {});
      setReservations((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reserva aprobada');
    } catch {
      toast.error('Error al aprobar la reserva');
    }
  };

  const openReject = (id: number) => {
    setRejectTarget(id);
    setRejectOpen(true);
  };

  const handleReject = async (id: number, rejection_reason: string) => {
    await localsService.rejectReservation(id, { rejection_reason });
    setReservations((prev) => prev.filter((r) => r.id !== id));
    toast.success('Reserva rechazada');
  };

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-navy">Reservas Pendientes</CardTitle>
        <span className="text-sm text-gray-500">
          {loading ? '...' : `${reservations.length} pendiente(s)`}
        </span>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Local</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Proposito</TableHead>
              <TableHead className="w-24">Asistentes</TableHead>
              <TableHead className="text-right w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  No hay reservas pendientes.
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
                    <div>{formatDateTime(res.start_time)}</div>
                    <div className="text-xs text-gray-400">al {formatDateTime(res.end_time)}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{res.purpose_display}</TableCell>
                  <TableCell className="text-sm text-gray-600">{res.expected_attendees}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-600 hover:bg-green-50"
                        title="Aprobar"
                        onClick={() => void handleApprove(res.id)}
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:bg-red-50"
                        title="Rechazar"
                        onClick={() => openReject(res.id)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <RejectDialog
        open={rejectOpen}
        reservationId={rejectTarget}
        onClose={() => { setRejectOpen(false); setRejectTarget(null); }}
        onConfirm={handleReject}
      />
    </Card>
  );
}
