import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  FileText,
  Paperclip,
  User,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { secretaryDocService } from '@/services/secretary-doc.service';
import type {
  SecretaryDocProcedure,
  SeguimientoTramite,
  Documento,
} from '@/types/secretary-doc.types';

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function SecretaryDocProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [procedure, setProcedure] = useState<SecretaryDocProcedure | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoTramite[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const proc = await secretaryDocService.getById(numericId);
        if (cancelled) return;
        setProcedure(proc);

        // El serializer detail incluye seguimientos/documentos anidados,
        // pero hacemos fallback explícito por si el campo viene vacío.
        setSeguimientos(proc.seguimientos ?? []);
        setDocumentos(proc.documentos ?? []);

        if (!proc.seguimientos || !proc.documentos) {
          const [segRes, docRes] = await Promise.allSettled([
            secretaryDocService.getSeguimientos(numericId),
            secretaryDocService.getDocumentos(numericId),
          ]);
          if (cancelled) return;
          if (segRes.status === 'fulfilled') setSeguimientos(segRes.value);
          if (docRes.status === 'fulfilled') setDocumentos(docRes.value);
        }
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

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
        <h2 className="text-xl font-semibold text-primary-navy mb-2">Trámite no encontrado</h2>
        <p className="text-gray-500 mb-6">El trámite que busca no existe o no tiene acceso a él.</p>
        <Button asChild variant="outline">
          <Link to="/procedures">Volver a Trámites</Link>
        </Button>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Error desconocido'}</p>
        <Button asChild variant="outline">
          <Link to="/procedures">Volver a Trámites</Link>
        </Button>
      </div>
    );
  }

  const studyLabel = STUDY_TYPE_LABELS[procedure.study_type] ?? procedure.study_type;
  const visibilityLabel =
    VISIBILITY_LABELS[procedure.visibility_type] ?? procedure.visibility_type;
  const interestLabel = INTEREST_LABELS[procedure.interest] ?? procedure.interest;

  const hasDocumentFields = Boolean(
    procedure.registry_volume || procedure.folio || procedure.number,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft size={14} /> Volver
      </Button>

      <JustCreatedBanner trackingNumber={procedure.id} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {studyLabel} · {visibilityLabel}
          </p>
          <h1 className="text-2xl font-bold text-primary-navy truncate">
            {procedure.document_type || 'Trámite de Secretaría'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Solicitud #{procedure.id} · creada el {formatDateShort(procedure.created_at)}
          </p>
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

      {/* Datos académicos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <GraduationCap size={16} /> Datos académicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Tipo de estudio" value={studyLabel} />
            <InfoField label="Alcance" value={visibilityLabel} />
            <InfoField label="Carrera" value={procedure.career} />
            <InfoField label="Año" value={procedure.year} />
            <InfoField label="Programa académico" value={procedure.academic_program} />
            <InfoField label="Tipo de documento" value={procedure.document_type} />
            <InfoField label="Tipo de interés" value={interestLabel} />
          </div>
        </CardContent>
      </Card>

      {/* Datos del solicitante */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <User size={16} /> Datos del solicitante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Nombre completo" value={procedure.full_name} />
            <InfoField
              label="Carné de identidad"
              value={<span className="font-mono">{procedure.id_card}</span>}
            />
            <InfoField label="Correo" value={procedure.email} />
            <InfoField label="Teléfono" value={procedure.phone} />
          </div>
        </CardContent>
      </Card>

      {/* Datos del documento */}
      {(hasDocumentFields || procedure.document_file_url) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
              <FileText size={16} /> Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {procedure.registry_volume && (
                <InfoField label="Tomo" value={procedure.registry_volume} />
              )}
              {procedure.folio && <InfoField label="Folio" value={procedure.folio} />}
              {procedure.number && <InfoField label="Número" value={procedure.number} />}
            </div>
            {procedure.document_file_url && (
              <div className="mt-4">
                <a
                  href={procedure.document_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Paperclip size={14} /> Ver documento adjunto
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seguimientos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
            <MessageSquare size={16} /> Seguimientos
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
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(seg.fecha)}
                    </span>
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

      {/* Documentos adjuntos */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-primary-navy flex items-center gap-2">
              <Paperclip size={16} /> Documentos adjuntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documentos.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
                >
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
