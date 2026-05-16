import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Play,
  Square,
  User as UserIcon,
  Users,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InfoField } from '@/components/procedure-detail/InfoField';
import { JustCreatedBanner } from '@/components/procedure-detail/JustCreatedBanner';
import { StatusStepper } from '@/components/procedure-detail/StatusStepper';
import {
  RESERVATION_FLOW,
  RESERVATION_FLOW_ORDER,
  RESERVATION_STATE_LABELS,
  RESERVATION_STATE_COLORS,
} from '@/components/procedure-detail/procedure-states';
import { useAuth } from '@/hooks/useAuth';
import { localsService } from '@/services/locals.service';
import type {
  ReservationDetail as ReservationDetailType,
  ReservationHistoryItem,
} from '@/types/locals.types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ReservationStateBadge({ state }: { state: string }) {
  const color = RESERVATION_STATE_COLORS[state] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const label = RESERVATION_STATE_LABELS[state] ?? state;
  return (
    <Badge variant="outline" className={cn('font-medium', color)}>
      {label}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canManageReservas } = useAuth();

  const [reservation, setReservation] = useState<ReservationDetailType | null>(null);
  const [history, setHistory] = useState<ReservationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  async function load() {
    if (!id) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [resData, histRes] = await Promise.allSettled([
        localsService.getReservation(numericId),
        localsService.getReservationHistory(numericId),
      ]);
      if (resData.status === 'fulfilled') {
        setReservation(resData.value);
      } else {
        const status = (resData.reason as { response?: { status?: number } })?.response?.status;
        if (status === 404) setNotFound(true);
        else if (status === 403) setError('No tiene acceso a esta reserva.');
        else setError('No se pudo cargar la reserva. Intente nuevamente.');
      }
      if (histRes.status === 'fulfilled') setHistory(histRes.value);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCancel() {
    if (!reservation || !cancelReason.trim()) return;
    setIsProcessing(true);
    try {
      await localsService.cancelReservation(reservation.id, {
        cancellation_reason: cancelReason.trim(),
      });
      toast.success('Reserva cancelada.');
      setCancelOpen(false);
      setCancelReason('');
      await load();
    } catch {
      toast.error('No se pudo cancelar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleApprove() {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      await localsService.approveReservation(reservation.id);
      toast.success('Reserva aprobada.');
      await load();
    } catch {
      toast.error('No se pudo aprobar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!reservation || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await localsService.rejectReservation(reservation.id, {
        rejection_reason: rejectReason.trim(),
      });
      toast.success('Reserva rechazada.');
      setRejectOpen(false);
      setRejectReason('');
      await load();
    } catch {
      toast.error('No se pudo rechazar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleStart() {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      await localsService.startReservation(reservation.id);
      toast.success('Reserva marcada en curso.');
      await load();
    } catch {
      toast.error('No se pudo marcar la reserva en curso.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleFinish() {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      await localsService.finishReservation(reservation.id);
      toast.success('Reserva finalizada.');
      await load();
    } catch {
      toast.error('No se pudo finalizar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit() {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      await localsService.submitReservation(reservation.id);
      toast.success('Reserva enviada para aprobación.');
      await load();
    } catch {
      toast.error('No se pudo enviar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={14} /> Volver
        </Button>
        <LoadingSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-primary-navy mb-2">Reserva no encontrada</h2>
        <p className="text-gray-500 mb-6">La reserva que busca no existe o no tiene acceso.</p>
        <Button asChild variant="outline">
          <Link to="/locals/my-reservations">Volver a mis reservas</Link>
        </Button>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Error desconocido'}</p>
        <Button asChild variant="outline">
          <Link to="/locals/my-reservations">Volver a mis reservas</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === reservation.user.id;
  const isDraft = reservation.state === 'BORRADOR';
  const isPending = reservation.state === 'PENDIENTE';
  const isApproved = reservation.state === 'APROBADA';
  const isInProgress = reservation.state === 'EN_CURSO';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft size={14} /> Volver
      </Button>

      <JustCreatedBanner
        trackingNumber={reservation.numero_seguimiento}
        title="¡Reserva creada con éxito!"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Reserva de local
          </p>
          <h1 className="text-2xl font-bold text-primary-navy truncate">
            {reservation.local.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            #{reservation.numero_seguimiento} · {reservation.purpose_display} · creada el{' '}
            {formatDateShort(reservation.created_at)}
          </p>
        </div>
        <ReservationStateBadge state={reservation.state} />
      </div>

      {/* Stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy">
            Estado de la reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <StatusStepper
            currentState={reservation.state}
            flow={RESERVATION_FLOW}
            flowOrder={RESERVATION_FLOW_ORDER}
            labels={RESERVATION_STATE_LABELS}
            colors={RESERVATION_STATE_COLORS}
            rejectedState="RECHAZADA"
          />
          {reservation.state === 'CANCELADA' && (
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-semibold">Cancelada.</span>{' '}
              {reservation.cancellation_reason ?? ''}
            </p>
          )}
          {reservation.state === 'RECHAZADA' && reservation.rejection_reason && (
            <p className="mt-4 text-sm text-red-700">
              <span className="font-semibold">Motivo del rechazo:</span>{' '}
              {reservation.rejection_reason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Datos de la reserva */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <CalendarDays size={16} /> Datos de la reserva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Inicio" value={formatDate(reservation.start_time)} />
            <InfoField label="Fin" value={formatDate(reservation.end_time)} />
            <InfoField label="Duración (h)" value={reservation.duration_hours} />
            <InfoField label="Propósito" value={reservation.purpose_display} />
            <InfoField label="Asistentes esperados" value={reservation.expected_attendees} />
            <InfoField label="Responsable" value={reservation.responsible_name} />
            <InfoField label="Teléfono responsable" value={reservation.responsible_phone} />
            <InfoField label="Email responsable" value={reservation.responsible_email} />
            <InfoField
              label="Detalle del propósito"
              value={reservation.purpose_detail}
              className="col-span-full"
            />
            {reservation.setup_requirements && (
              <InfoField
                label="Requerimientos especiales"
                value={reservation.setup_requirements}
                className="col-span-full"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Local */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <MapPin size={16} /> Local reservado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Nombre" value={reservation.local.name} />
            <InfoField label="Código" value={reservation.local.code} />
            <InfoField label="Tipo" value={reservation.local.local_type_display} />
            <InfoField label="Capacidad" value={reservation.local.capacity} />
          </div>
          <Button asChild variant="link" size="sm" className="mt-2 px-0">
            <Link to={`/locals/${reservation.local.id}`}>Ver ficha del local</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Solicitante */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <UserIcon size={16} /> Solicitante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Nombre" value={reservation.user.full_name} />
            <InfoField label="Correo" value={reservation.user.email} />
            {reservation.approved_by && (
              <>
                <InfoField label="Aprobado por" value={reservation.approved_by.full_name} />
                {reservation.approved_at && (
                  <InfoField label="Aprobado el" value={formatDate(reservation.approved_at)} />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acciones del solicitante */}
      {(isOwner || canManageReservas) && (isDraft || reservation.can_be_cancelled) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
              <Users size={16} /> Acciones disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {isDraft && isOwner && (
              <Button onClick={handleSubmit} disabled={isProcessing} className="gap-1.5">
                <CheckCircle2 size={14} /> Enviar para aprobación
              </Button>
            )}
            {reservation.can_be_cancelled && (
              <Button
                variant="outline"
                onClick={() => setCancelOpen(true)}
                disabled={isProcessing}
                className="gap-1.5"
              >
                <X size={14} /> Cancelar reserva
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones del gestor */}
      {canManageReservas && (isPending || isApproved || isInProgress) && (
        <Card className="border-primary-navy/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary-navy">
              Acciones del gestor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {isPending && (
              <>
                <Button onClick={handleApprove} disabled={isProcessing} className="gap-1.5">
                  <CheckCircle2 size={14} /> Aprobar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectOpen(true)}
                  disabled={isProcessing}
                  className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
                >
                  <XCircle size={14} /> Rechazar
                </Button>
              </>
            )}
            {isApproved && (
              <Button onClick={handleStart} disabled={isProcessing} className="gap-1.5">
                <Play size={14} /> Marcar en curso
              </Button>
            )}
            {(isInProgress || isApproved) && (
              <Button
                variant={isInProgress ? 'default' : 'outline'}
                onClick={handleFinish}
                disabled={isProcessing}
                className="gap-1.5"
              >
                <Square size={14} /> Marcar finalizada
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <MessageSquare size={16} /> Historial
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin movimientos registrados.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-6 pl-4">
              {history.map((h) => (
                <li key={h.id} className="ml-2">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary-navy/30" />
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-medium">
                      {h.action}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(h.timestamp)}
                    </span>
                  </div>
                  {h.user && (
                    <p className="text-xs text-gray-500 mb-1">por {h.user.full_name}</p>
                  )}
                  {typeof h.details?.message === 'string' && (
                    <p className="text-sm text-gray-700">{h.details.message as string}</p>
                  )}
                  {typeof h.details?.reason === 'string' && (
                    <p className="text-sm text-red-700">
                      Motivo: {h.details.reason as string}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Dialog Cancelar */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              Indique el motivo de la cancelación. Esta acción no puede deshacerse.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Motivo..."
            rows={3}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isProcessing || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancelar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar reserva</DialogTitle>
            <DialogDescription>
              Indique el motivo del rechazo. El solicitante lo verá en su detalle.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo..."
            rows={3}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Volver
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
