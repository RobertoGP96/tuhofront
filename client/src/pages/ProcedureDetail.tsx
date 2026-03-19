import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { proceduresService } from '../services/procedures.service';
import type { Procedure, ProcedureNote, ProcedureState } from '../types/procedures.types';

// --- State config ---

interface StateConfig {
  label: string;
  badgeClass: string;
  stepClass: string;
}

const STATE_CONFIG: Record<ProcedureState, StateConfig> = {
  BORRADOR:      { label: 'Borrador',       badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',     stepClass: 'bg-gray-400' },
  ENVIADO:       { label: 'Enviado',        badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',     stepClass: 'bg-blue-500' },
  EN_PROCESO:    { label: 'En proceso',     badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',  stepClass: 'bg-amber-500' },
  REQUIERE_INFO: { label: 'Requiere info',  badgeClass: 'bg-orange-100 text-orange-700 border-orange-300', stepClass: 'bg-orange-500' },
  APROBADO:      { label: 'Aprobado',       badgeClass: 'bg-green-100 text-green-700 border-green-300',  stepClass: 'bg-green-500' },
  RECHAZADO:     { label: 'Rechazado',      badgeClass: 'bg-red-100 text-red-700 border-red-300',        stepClass: 'bg-red-500' },
  FINALIZADO:    { label: 'Finalizado',     badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300', stepClass: 'bg-emerald-600' },
};

// Main flow steps (excludes REQUIERE_INFO which is a side state)
const MAIN_FLOW: ProcedureState[] = [
  'BORRADOR',
  'ENVIADO',
  'EN_PROCESO',
  'APROBADO',
  'FINALIZADO',
];

// Order index used to determine completed steps in the main flow
const FLOW_ORDER: Record<ProcedureState, number> = {
  BORRADOR:      0,
  ENVIADO:       1,
  EN_PROCESO:    2,
  REQUIERE_INFO: 2, // same tier as EN_PROCESO
  APROBADO:      3,
  RECHAZADO:     3,
  FINALIZADO:    4,
};

// --- Sub-components ---

function StateBadge({ state }: { state: ProcedureState }) {
  const cfg = STATE_CONFIG[state];
  return (
    <Badge variant="outline" className={`text-sm px-3 py-1 font-semibold ${cfg.badgeClass}`}>
      {cfg.label}
    </Badge>
  );
}

function StatusStepper({ currentState }: { currentState: ProcedureState }) {
  const currentOrder = FLOW_ORDER[currentState];
  const isRejected = currentState === 'RECHAZADO';
  const isRequiresInfo = currentState === 'REQUIERE_INFO';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />

        {MAIN_FLOW.map((step, index) => {
          const cfg = STATE_CONFIG[step];
          const stepOrder = FLOW_ORDER[step];
          const isActive = currentState === step;
          const isCompleted = currentOrder > stepOrder;
          // For RECHAZADO, highlight the terminal differently
          const isRejectedActive = isRejected && step === 'APROBADO';

          let circleClass = 'bg-gray-200 border-gray-300 text-gray-400';
          if (isActive || isRejectedActive) {
            circleClass = `${cfg.stepClass} border-transparent text-white`;
            if (isRejectedActive) circleClass = `${STATE_CONFIG.RECHAZADO.stepClass} border-transparent text-white`;
          } else if (isCompleted) {
            circleClass = 'bg-primary-navy border-primary-navy text-white';
          }

          const label = isRejectedActive ? STATE_CONFIG.RECHAZADO.label : cfg.label;

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${circleClass}`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className="mt-2 text-xs text-gray-500 text-center leading-tight max-w-[70px]">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Side state indicator for REQUIERE_INFO */}
      {isRequiresInfo && (
        <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>El tramite requiere informacion adicional de su parte</span>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface NoteItemProps {
  note: ProcedureNote;
}

function NoteItem({ note }: NoteItemProps) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium text-gray-700">Usuario #{note.user}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDateTime(note.created_at)}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
    </div>
  );
}

// --- Loading skeleton ---

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded w-1/2" />
      <div className="h-24 bg-gray-200 rounded" />
      <div className="h-48 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  );
}

// --- Main page ---

export default function ProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [notes, setNotes] = useState<ProcedureNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [proc, notesRes] = await Promise.all([
          proceduresService.getProcedure(id!),
          proceduresService.getProcedureNotes(id!),
        ]);
        if (cancelled) return;
        setProcedure(proc);
        setNotes(notesRes.results);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          setError('No se pudo cargar el tramite. Intente nuevamente.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) return <LoadingSkeleton />;

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-primary-navy mb-2">Tramite no encontrado</h2>
        <p className="text-gray-500 mb-6">El tramite que busca no existe o no tiene acceso a el.</p>
        <Button asChild variant="outline">
          <Link to="/procedures">Volver a Tramites</Link>
        </Button>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Error desconocido'}</p>
        <Button asChild variant="outline">
          <Link to="/procedures">Volver a Tramites</Link>
        </Button>
      </div>
    );
  }

  const isBorrador = procedure.state === 'BORRADOR';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-gray-500 hover:text-primary-navy -ml-2">
            <Link to="/procedures">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tramites
            </Link>
          </Button>
        </div>
        <StateBadge state={procedure.state} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-primary-navy">
          Tramite #{procedure.follow_number}
        </h1>
      </div>

      {/* Status stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy">Estado del tramite</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <StatusStepper currentState={procedure.state} />
        </CardContent>
      </Card>

      {/* Details card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Detalles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Numero de seguimiento</p>
              <p className="font-medium text-gray-800">{procedure.follow_number}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Creado</p>
              <p className="font-medium text-gray-800">{formatDate(procedure.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Ultima actualizacion</p>
              <p className="font-medium text-gray-800">{formatDate(procedure.updated_at)}</p>
            </div>
            {procedure.deadline && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Fecha limite</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {formatDate(procedure.deadline)}
                </p>
              </div>
            )}
          </div>

          {procedure.observation && (
            <>
              <Separator />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Observacion</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {procedure.observation}
                </p>
              </div>
            </>
          )}

          {isBorrador && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  El tramite esta en borrador. Puede enviarlo cuando este listo.
                </p>
                <Button size="sm" className="ml-4 shrink-0">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notas ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin notas por el momento.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
