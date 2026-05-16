import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Send, XCircle, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { localsService } from '@/services/locals.service';
import type { ReservationListItem, ReservationState } from '@/types/locals.types';

const STATE_BADGE: Record<ReservationState, { label: string; classes: string }> = {
  BORRADOR: { label: 'Borrador', classes: 'bg-gray-100 text-gray-700' },
  PENDIENTE: { label: 'Pendiente', classes: 'bg-blue-100 text-blue-700' },
  APROBADA: { label: 'Aprobada', classes: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada', classes: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', classes: 'bg-orange-100 text-orange-700' },
  EN_CURSO: { label: 'En curso', classes: 'bg-amber-100 text-amber-800' },
  FINALIZADA: { label: 'Finalizada', classes: 'bg-emerald-100 text-emerald-700' },
};

const PURPOSE_LABELS: Record<string, string> = {
  CLASE: 'Clase',
  EXAMEN: 'Examen',
  REUNION: 'Reunión',
  EVENTO: 'Evento',
  TALLER: 'Taller',
  CONFERENCIA: 'Conferencia',
  ESTUDIO: 'Estudio',
  OTRO: 'Otro',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StateBadge({ state }: { state: ReservationState }) {
  const cfg = STATE_BADGE[state] ?? { label: state, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export default function MyReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [submitting, setSubmitting] = useState<number | null>(null);

  function fetchReservations() {
    setLoading(true);
    localsService
      .getMyReservations()
      .then(setReservations)
      .catch(() => toast.error('No se pudieron cargar las reservas'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  async function handleSubmit(id: number) {
    setSubmitting(id);
    try {
      await localsService.submitReservation(id);
      toast.success('Reserva enviada para aprobación');
      fetchReservations();
    } catch {
      toast.error('No se pudo enviar la reserva');
    } finally {
      setSubmitting(null);
    }
  }

  function openCancelDialog(id: number) {
    setSelectedId(id);
    setCancelReason('');
    setCancelDialogOpen(true);
  }

  async function handleCancel() {
    if (!selectedId) return;
    if (!cancelReason.trim()) {
      toast.error('Debes indicar el motivo de cancelación');
      return;
    }
    setCancelling(true);
    try {
      await localsService.cancelReservation(selectedId, {
        cancellation_reason: cancelReason,
      });
      toast.success('Reserva cancelada');
      setCancelDialogOpen(false);
      fetchReservations();
    } catch {
      toast.error('No se pudo cancelar la reserva');
    } finally {
      setCancelling(false);
    }
  }

  const canSubmit = (state: ReservationState) => state === 'BORRADOR';
  const canCancel = (state: ReservationState) =>
    state === 'PENDIENTE' || state === 'APROBADA';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary-navy">Mis Reservas</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gestiona tus reservas de locales universitarios
            </p>
          </div>
          <Button
            className="bg-primary-navy hover:bg-primary-navy/90 text-white flex items-center gap-2"
            onClick={() => navigate('/locals/reserve')}
          >
            <Plus size={16} />
            Nueva reserva
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Calendar size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tienes reservas aún</p>
            <p className="text-sm mt-1">Reserva un espacio universitario para comenzar</p>
            <Button
              className="mt-6 bg-primary-navy hover:bg-primary-navy/90 text-white"
              onClick={() => navigate('/locals/reserve')}
            >
              <Plus size={16} className="mr-2" />
              Crear reserva
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-primary-navy text-sm">
                        {res.local_name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{res.local_code}</span>
                      <StateBadge state={res.state} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(res.start_time)} — {formatDateTime(res.end_time)}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                        {PURPOSE_LABELS[res.purpose] ?? res.purpose}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">
                        #{res.numero_seguimiento}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="text-primary-navy hover:bg-primary-navy/5 flex items-center gap-1"
                    >
                      <Link to={`/locals/my-reservations/${res.id}`}>
                        <Eye size={13} /> Ver
                      </Link>
                    </Button>
                    {canSubmit(res.state) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submitting === res.id}
                        onClick={() => handleSubmit(res.id)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                      >
                        <Send size={13} />
                        {submitting === res.id ? 'Enviando...' : 'Enviar'}
                      </Button>
                    )}
                    {canCancel(res.state) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCancelDialog(res.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle size={13} />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer. Indica el motivo de cancelación.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason">
                Motivo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Describe el motivo de la cancelación..."
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Volver
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? 'Cancelando...' : 'Confirmar cancelación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
