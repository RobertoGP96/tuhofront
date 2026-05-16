import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Users,
  UtensilsCrossed,
  BedDouble,
  Bus,
  Wrench,
  Send,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StateBadge } from '@/components/StateBadge';
import { InfoField } from '@/components/procedure-detail/InfoField';
import { JustCreatedBanner } from '@/components/procedure-detail/JustCreatedBanner';
import { StatusStepper } from '@/components/procedure-detail/StatusStepper';
import {
  PROCEDURE_FLOW,
  PROCEDURE_FLOW_ORDER,
  PROCEDURE_STATE_LABELS_MAP,
  PROCEDURE_STATE_COLORS_MAP,
} from '@/components/procedure-detail/procedure-states';
import { VALID_STATE_TRANSITIONS, STATE_LABELS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import {
  feedingService,
  accommodationService,
  transportService,
  maintenanceService,
} from '@/services/internal.service';
import { internalAdminService } from '@/services/internal-admin.service';
import type {
  FeedingProcedure,
  AccommodationProcedure,
  TransportProcedure,
  MaintanceProcedure,
  InternalProcedureState,
  InternalProcedureType,
} from '@/types/internal.types';

type AnyInternalProcedure =
  | FeedingProcedure
  | AccommodationProcedure
  | TransportProcedure
  | MaintanceProcedure;

const TYPE_META: Record<
  InternalProcedureType,
  { label: string; icon: typeof UtensilsCrossed; backHref: string }
> = {
  feeding: {
    label: 'Solicitud de alimentación',
    icon: UtensilsCrossed,
    backHref: '/procedures/internals',
  },
  accommodation: {
    label: 'Solicitud de alojamiento',
    icon: BedDouble,
    backHref: '/procedures/internals',
  },
  transport: {
    label: 'Solicitud de transporte',
    icon: Bus,
    backHref: '/procedures/internals',
  },
  maintenance: {
    label: 'Solicitud de mantenimiento',
    icon: Wrench,
    backHref: '/procedures/internals',
  },
};

function isValidType(type: string | undefined): type is InternalProcedureType {
  return type === 'feeding' || type === 'accommodation' || type === 'transport' || type === 'maintenance';
}

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

async function fetchProcedure(
  type: InternalProcedureType,
  id: number,
): Promise<AnyInternalProcedure> {
  switch (type) {
    case 'feeding':
      return feedingService.getById(id);
    case 'accommodation':
      return accommodationService.getById(id);
    case 'transport':
      return transportService.getById(id);
    case 'maintenance':
      return maintenanceService.getById(id);
  }
}

async function changeProcedureState(
  type: InternalProcedureType,
  id: number,
  newState: InternalProcedureState,
): Promise<void> {
  switch (type) {
    case 'feeding':
      await internalAdminService.updateFeedingProcedure(id, { state: newState });
      return;
    case 'accommodation':
      await internalAdminService.updateAccommodationProcedure(id, { state: newState });
      return;
    case 'transport':
      await internalAdminService.updateTransportProcedure(id, { state: newState });
      return;
    case 'maintenance':
      await internalAdminService.updateMaintenanceProcedure(id, { state: newState });
      return;
  }
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

function FeedingDetails({ proc }: { proc: FeedingProcedure }) {
  return (
    <>
      <InfoField label="Tipo" value={proc.feeding_type === 'RESTAURANT' ? 'Restaurante' : 'Hotelito'} />
      <InfoField label="Fecha de inicio" value={formatDateShort(proc.start_day)} />
      <InfoField label="Fecha de fin" value={formatDateShort(proc.end_day)} />
      <InfoField label="Cantidad de personas" value={proc.amount} />
      <InfoField label="Descripción" value={proc.description} className="col-span-full" />
      {proc.feeding_days && proc.feeding_days.length > 0 && (
        <div className="col-span-full">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Detalle por día
          </p>
          <div className="overflow-x-auto rounded-md border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Desayuno</th>
                  <th className="px-3 py-2">Almuerzo</th>
                  <th className="px-3 py-2">Cena</th>
                  <th className="px-3 py-2">Merienda</th>
                </tr>
              </thead>
              <tbody>
                {proc.feeding_days.map((d, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-700">{formatDateShort(d.date)}</td>
                    <td className="px-3 py-2">{d.breakfast}</td>
                    <td className="px-3 py-2">{d.lunch}</td>
                    <td className="px-3 py-2">{d.dinner}</td>
                    <td className="px-3 py-2">{d.snack}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function AccommodationDetails({ proc }: { proc: AccommodationProcedure }) {
  return (
    <>
      <InfoField
        label="Tipo"
        value={proc.accommodation_type === 'HOTEL' ? 'Hotel' : 'Posgrado'}
      />
      <InfoField label="Fecha de inicio" value={formatDateShort(proc.start_day)} />
      <InfoField label="Fecha de fin" value={formatDateShort(proc.end_day)} />
      <InfoField label="Cantidad de huéspedes" value={proc.guests?.length ?? 0} />
      <InfoField label="Descripción" value={proc.description} className="col-span-full" />
      {proc.guests && proc.guests.length > 0 && (
        <div className="col-span-full">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
            <Users size={12} /> Huéspedes
          </p>
          <ul className="space-y-1.5">
            {proc.guests.map((g, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-800">{g.name}</span>
                <span className="text-xs text-gray-500">
                  {g.sex === 'M' ? 'M' : 'F'} · {g.identification}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function TransportDetails({ proc }: { proc: TransportProcedure }) {
  const typeName =
    typeof proc.procedure_type === 'object' && proc.procedure_type
      ? proc.procedure_type.name
      : `#${proc.procedure_type}`;

  return (
    <>
      <InfoField label="Tipo de transporte" value={typeName} />
      <InfoField label="Pasajeros" value={proc.passengers} />
      <InfoField label="Ida y vuelta" value={proc.round_trip ? 'Sí' : 'No'} />
      <InfoField label="Salida" value={formatDate(proc.departure_time)} />
      <InfoField label="Regreso" value={formatDate(proc.return_time)} />
      {proc.plate && <InfoField label="Matrícula" value={proc.plate} />}
      <InfoField label="Lugar de salida" value={proc.departure_place} className="col-span-full" />
      <InfoField label="Lugar de regreso" value={proc.return_place} className="col-span-full" />
      <InfoField label="Descripción" value={proc.description} className="col-span-full" />
    </>
  );
}

function MaintenanceDetails({ proc }: { proc: MaintanceProcedure }) {
  const typeName =
    typeof proc.procedure_type === 'object' && proc.procedure_type
      ? proc.procedure_type.name
      : `#${proc.procedure_type}`;
  const priorityName =
    typeof proc.priority === 'object' && proc.priority ? proc.priority.name : `#${proc.priority}`;

  return (
    <>
      <InfoField label="Tipo" value={typeName} />
      <InfoField label="Prioridad" value={priorityName} />
      <InfoField label="Descripción" value={proc.description} className="col-span-full" />
      {proc.picture && (
        <div className="col-span-full">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
            <ImageIcon size={12} /> Foto adjunta
          </p>
          <a href={proc.picture} target="_blank" rel="noreferrer" className="block">
            <img
              src={proc.picture}
              alt="Foto adjunta"
              className="max-h-64 rounded-md border border-gray-100 object-contain"
            />
          </a>
        </div>
      )}
    </>
  );
}

export default function InternalProcedureDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { canManageInternal } = useAuth();

  const [procedure, setProcedure] = useState<AnyInternalProcedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Estado del gestor para cambiar el estado del trámite
  const [selectedState, setSelectedState] = useState<InternalProcedureState | ''>('');
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!type || !isValidType(type) || !id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const proc = await fetchProcedure(type as InternalProcedureType, numericId);
        if (!cancelled) setProcedure(proc);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) setNotFound(true);
        else if (status === 403) setError('No tiene acceso a este trámite.');
        else setError('No se pudo cargar el trámite. Intente nuevamente.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  async function handleSaveState() {
    if (!procedure || !selectedState || !type || !isValidType(type)) return;
    setIsSaving(true);
    try {
      await changeProcedureState(type, procedure.id, selectedState);
      // Si el gestor escribió una observación, registrarla como nota.
      if (observation.trim()) {
        try {
          await internalAdminService.createNote({
            procedure: procedure.id,
            content: observation.trim(),
          });
        } catch {
          // No bloquear el flujo si la nota falla.
        }
      }
      toast.success('Estado actualizado correctamente.');
      const updated = await fetchProcedure(type, procedure.id);
      setProcedure(updated);
      setSelectedState('');
      setObservation('');
    } catch {
      toast.error('No se pudo actualizar el estado. Intente nuevamente.');
    } finally {
      setIsSaving(false);
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

  if (notFound || !type || !isValidType(type)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-primary-navy mb-2">Trámite no encontrado</h2>
        <p className="text-gray-500 mb-6">El trámite que busca no existe o no tiene acceso a él.</p>
        <Button asChild variant="outline">
          <Link to="/procedures/internals">Volver a mis trámites</Link>
        </Button>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Error desconocido'}</p>
        <Button asChild variant="outline">
          <Link to="/procedures/internals">Volver a mis trámites</Link>
        </Button>
      </div>
    );
  }

  const meta = TYPE_META[type];
  const TypeIcon = meta.icon;
  const availableTransitions = (VALID_STATE_TRANSITIONS[procedure.state] ??
    []) as InternalProcedureState[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft size={14} /> Volver
      </Button>

      <JustCreatedBanner trackingNumber={procedure.id} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary-navy/5 text-primary-navy shrink-0">
            <TypeIcon size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Trámite interno
            </p>
            <h1 className="text-2xl font-bold text-primary-navy">{meta.label}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Solicitud #{procedure.id} · creada el {formatDateShort(procedure.created_at)}
              {procedure.username ? ` · ${procedure.username}` : ''}
            </p>
          </div>
        </div>
        <StateBadge state={procedure.state} className="shrink-0" />
      </div>

      {/* Stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy">
            Estado del trámite
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <StatusStepper
            currentState={procedure.state}
            flow={PROCEDURE_FLOW}
            flowOrder={PROCEDURE_FLOW_ORDER}
            labels={PROCEDURE_STATE_LABELS_MAP}
            colors={PROCEDURE_STATE_COLORS_MAP}
            rejectedState="RECHAZADO"
            warningState="REQUIERE_INFO"
            warningLabel="El trámite requiere información adicional de su parte."
          />
        </CardContent>
      </Card>

      {/* Detalles específicos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <FileText size={16} /> Detalles de la solicitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {type === 'feeding' && <FeedingDetails proc={procedure as FeedingProcedure} />}
            {type === 'accommodation' && (
              <AccommodationDetails proc={procedure as AccommodationProcedure} />
            )}
            {type === 'transport' && <TransportDetails proc={procedure as TransportProcedure} />}
            {type === 'maintenance' && (
              <MaintenanceDetails proc={procedure as MaintanceProcedure} />
            )}
            <InfoField
              label="Última actualización"
              value={formatDate(procedure.updated_at)}
              className="col-span-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cambio de estado (sólo gestores) */}
      {canManageInternal && availableTransitions.length > 0 && (
        <Card className="border-primary-navy/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
              <Send size={16} /> Acciones del gestor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nuevo estado</label>
                <Select
                  value={selectedState}
                  onValueChange={(v) => setSelectedState(v as InternalProcedureState)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTransitions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATE_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Observaciones</label>
              <Textarea
                placeholder="Comentario interno opcional..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              {selectedState && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedState('');
                    setObservation('');
                  }}
                  className="gap-1.5 text-gray-600"
                >
                  <XCircle size={14} /> Cancelar
                </Button>
              )}
              <Button
                onClick={handleSaveState}
                disabled={isSaving || !selectedState}
                className="bg-primary-navy hover:bg-primary-navy/90 text-white gap-1.5"
              >
                <Send size={14} />
                {isSaving ? 'Guardando...' : 'Aplicar cambio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas */}
      {procedure.notes && procedure.notes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
              <MessageSquare size={16} /> Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-gray-200 space-y-4 pl-4">
              {procedure.notes.map((note) => (
                <li key={note.id} className="ml-2">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary-navy/30" />
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <Clock size={12} /> {formatDate(note.created_at)}
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
