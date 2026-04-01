import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  FileText,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { StateBadge } from '@/components/StateBadge';
import { STATE_LABELS, VALID_TRANSITIONS } from '@/lib/constants';
import { secretaryAdminService } from '../services/secretary-admin.service';
import type { SecretaryDocProcedure, SeguimientoTramite, Documento } from '../types/secretary-doc.types';

const STUDY_TYPE_LABELS: Record<string, string> = {
  PREGRADO: 'Pregrado',
  POSGRADO: 'Posgrado',
};

const VISIBILITY_LABELS: Record<string, string> = {
  NACIONAL: 'Nacional',
  INTERNACIONAL: 'Internacional',
};

const INTEREST_LABELS: Record<string, string> = {
  ESTATAL: 'Estatal',
  NO_ESTATAL: 'No Estatal',
};

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

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecretaryProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [procedure, setProcedure] = useState<SecretaryDocProcedure | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoTramite[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState('');
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function fetchAll() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [procResult, segResult, docResult] = await Promise.allSettled([
        secretaryAdminService.getProcedure(Number(id)),
        secretaryAdminService.getSeguimientos(Number(id)),
        secretaryAdminService.getDocumentos(Number(id)),
      ]);

      if (procResult.status === 'fulfilled') {
        setProcedure(procResult.value);
      } else {
        setError('No se pudo cargar el trámite. Verifique que exista.');
      }
      if (segResult.status === 'fulfilled') setSeguimientos(segResult.value);
      if (docResult.status === 'fulfilled') setDocumentos(docResult.value);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function handleSaveState() {
    if (!procedure || !selectedState) return;
    setIsSaving(true);
    try {
      await secretaryAdminService.changeState(procedure.id, {
        estado: selectedState,
        observaciones: observation.trim() || undefined,
      });
      toast.success('Estado del trámite actualizado.');
      setSelectedState('');
      setObservation('');
      await fetchAll();
    } catch {
      toast.error('Error al actualizar el estado. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const availableTransitions = procedure ? (VALID_TRANSITIONS[procedure.state] ?? []) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={14} /> Volver
        </Button>
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={14} /> Volver
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Trámite no encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2 shrink-0">
          <ArrowLeft size={14} /> Volver
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-primary-navy truncate">{procedure.full_name}</h1>
          <p className="text-sm text-gray-400">
            {STUDY_TYPE_LABELS[procedure.study_type] ?? procedure.study_type}
            {' · '}
            {VISIBILITY_LABELS[procedure.visibility_type] ?? procedure.visibility_type}
            {' · '}
            Creado el {formatDateShort(procedure.created_at)}
          </p>
        </div>
        <div className="ml-auto shrink-0">
          <StateBadge state={procedure.state} />
        </div>
      </div>

      {/* Main info card */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-primary-navy flex items-center gap-2">
            <FileText size={16} />
            Información del Trámite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Nombre Completo" value={procedure.full_name} />
            <InfoField label="Carné de Identidad" value={<span className="font-mono">{procedure.id_card}</span>} />
            <InfoField label="Correo Electrónico" value={procedure.email} />
            <InfoField label="Teléfono" value={procedure.phone} />
            <InfoField label="Carrera" value={procedure.career} />
            <InfoField label="Año de Graduación" value={procedure.year} />
            <InfoField label="Programa Académico" value={procedure.academic_program} />
            <InfoField label="Tipo de Documento" value={procedure.document_type} />
            <InfoField label="Tipo de Interés" value={INTEREST_LABELS[procedure.interest] ?? procedure.interest} />
            <InfoField label="Tipo de Estudio" value={STUDY_TYPE_LABELS[procedure.study_type] ?? procedure.study_type} />
            <InfoField label="Alcance" value={VISIBILITY_LABELS[procedure.visibility_type] ?? procedure.visibility_type} />
            <InfoField label="Estado Actual" value={<StateBadge state={procedure.state} />} />
            {procedure.registry_volume && <InfoField label="Tomo" value={procedure.registry_volume} />}
            {procedure.folio && <InfoField label="Folio" value={procedure.folio} />}
            {procedure.number && <InfoField label="Número" value={procedure.number} />}
            <div className="col-span-2 md:col-span-3">
              <InfoField label="Fecha de Creación" value={formatDate(procedure.created_at)} />
            </div>
            {procedure.document_file_url && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documento Adjunto</p>
                <a
                  href={procedure.document_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Paperclip size={14} /> Ver documento
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* State management */}
      {availableTransitions.length > 0 && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-navy">Cambiar Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nuevo estado</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
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
                placeholder="Escriba una observación opcional..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveState}
                disabled={isSaving || !selectedState}
                className="bg-primary-navy hover:bg-primary-navy/90 text-white"
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seguimientos */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-primary-navy flex items-center gap-2">
            <Clock size={16} />
            Seguimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seguimientos.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin seguimientos registrados.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-6 pl-4">
              {seguimientos.map((seg) => (
                <li key={seg.id} className="ml-2">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary-navy/30" />
                  <div className="flex items-center gap-2 mb-1">
                    <StateBadge state={seg.estado} />
                    <span className="text-xs text-gray-400">{formatDateShort(seg.fecha)}</span>
                  </div>
                  {seg.observaciones && (
                    <p className="text-sm text-gray-600">{seg.observaciones}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-primary-navy flex items-center gap-2">
            <Paperclip size={16} />
            Documentos Adjuntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin documentos adjuntos.</p>
          ) : (
            <ul className="space-y-2">
              {documentos.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3">
                  <FileText size={16} className="text-primary-navy opacity-60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.nombre}</p>
                    <p className="text-xs text-gray-400">{formatDateShort(doc.fecha_subida)}</p>
                  </div>
                  <a
                    href={doc.archivo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline shrink-0"
                  >
                    Descargar
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
