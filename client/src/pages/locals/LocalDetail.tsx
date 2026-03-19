import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { localsService } from '@/services/locals.service';
import { useAuth } from '@/hooks/useAuth';
import type { LocalDetail as LocalDetailType, LocalType } from '@/types/locals.types';

const TYPE_BADGE_CLASSES: Record<LocalType, string> = {
  AULA: 'bg-blue-100 text-blue-800',
  LABORATORIO: 'bg-purple-100 text-purple-800',
  AUDITORIO: 'bg-amber-100 text-amber-800',
  SALA_REUNIONES: 'bg-teal-100 text-teal-800',
  BIBLIOTECA: 'bg-indigo-100 text-indigo-800',
  GIMNASIO: 'bg-orange-100 text-orange-800',
  CAFETERIA: 'bg-pink-100 text-pink-800',
  OTRO: 'bg-gray-100 text-gray-800',
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
  const d = new Date(iso);
  return d.toLocaleString('es-CU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function LocalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [local, setLocal] = useState<LocalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    localsService
      .getLocal(Number(id))
      .then(setLocal)
      .catch(() => setError('No se pudo cargar el local. Intenta nuevamente.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !local) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">{error ?? 'Local no encontrado'}</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/locals')}>
          <ChevronLeft size={16} className="mr-1" />
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/locals')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-navy transition-colors"
        >
          <ChevronLeft size={16} />
          Volver al catálogo
        </button>

        {/* Image */}
        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          {local.image ? (
            <img
              src={local.image}
              alt={local.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Building2 size={80} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Header info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-navy leading-tight">
                {local.name}
              </h1>
              <p className="text-sm text-gray-400 font-mono mt-1">{local.code}</p>
            </div>
            {isAuthenticated && local.is_active && (
              <Button
                className="bg-primary-navy hover:bg-primary-navy/90 text-white flex items-center gap-2 shrink-0"
                onClick={() => navigate(`/locals/reserve?local=${local.id}`)}
              >
                <Plus size={16} />
                Reservar
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                TYPE_BADGE_CLASSES[local.local_type]
              }`}
            >
              {local.local_type_display}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                local.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {local.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Users size={14} />
              Capacidad: <strong>{local.capacity}</strong>
            </span>
            {local.is_available_now ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={13} />
                Disponible ahora
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                <XCircle size={13} />
                No disponible ahora
              </span>
            )}
            {local.requires_approval && (
              <Badge variant="outline" className="text-xs">
                Requiere aprobación
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Description */}
        {local.description && (
          <div>
            <h2 className="text-lg font-bold text-primary-navy mb-2">Descripción</h2>
            <p className="text-gray-600 leading-relaxed">{local.description}</p>
          </div>
        )}

        {/* Upcoming reservations */}
        <div>
          <h2 className="text-lg font-bold text-primary-navy mb-3 flex items-center gap-2">
            <Calendar size={18} />
            Próximas reservas
          </h2>
          {local.upcoming_reservations.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">
              No hay reservas próximas para este local.
            </p>
          ) : (
            <div className="space-y-2">
              {local.upcoming_reservations.map((res) => (
                <Card key={res.id} className="border border-gray-200">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        <span>{formatDateTime(res.start_time)}</span>
                        <span className="text-gray-400">—</span>
                        <span>{formatDateTime(res.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {PURPOSE_LABELS[res.purpose] ?? res.purpose}
                        </span>
                        <span>{res.responsible_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reserve CTA for unauthenticated */}
        {!isAuthenticated && local.is_active && (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Inicia sesión para reservar este espacio
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white"
              >
                Iniciar sesión
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
