import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
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
import { notificationsService } from '../services/notifications.service';
import type { Notificacion, NotificacionStats } from '../types/notifications.types';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
} from '@/lib/constants';

// ---- Constants ----

const PAGE_SIZE = 15;

const TIPO_OPTIONS = [
  { value: 'ALL', label: 'Todos los tipos' },
  ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const PRIORIDAD_OPTIONS = [
  { value: 'ALL', label: 'Todas las prioridades' },
  ...Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
];

const VISTO_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'true', label: 'Leídas' },
  { value: 'false', label: 'No leídas' },
];

// ---- Helpers ----

function getPriorityBorderClass(prioridad: string): string {
  if (prioridad === 'CRITICAL' || prioridad === 'HIGH') return 'border-l-4 border-l-red-500';
  if (prioridad === 'MEDIUM') return 'border-l-4 border-l-amber-400';
  return 'border-l-4 border-l-gray-300';
}

function getPriorityBadgeClass(prioridad: string): string {
  if (prioridad === 'CRITICAL' || prioridad === 'HIGH')
    return 'bg-red-100 text-red-700 border-red-200';
  if (prioridad === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function getTypeBadgeClass(tipo: string): string {
  if (tipo === 'ERROR') return 'bg-red-100 text-red-700 border-red-200';
  if (tipo === 'WARNING' || tipo === 'URGENT') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (tipo === 'SUCCESS') return 'bg-green-100 text-green-700 border-green-200';
  if (tipo === 'ACADEMIC' || tipo === 'PROCEDURE')
    return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

// ---- Sub-components ----

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-gray-100 shadow-sm">
          <CardContent className="p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function NotificationCardSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2 bg-white">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  colorClass: string;
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [stats, setStats] = useState<NotificacionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const [tipoFilter, setTipoFilter] = useState('ALL');
  const [prioridadFilter, setPrioridadFilter] = useState('ALL');
  const [vistoFilter, setVistoFilter] = useState('ALL');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setPage(1), 0);
    };
  }

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await notificationsService.getStats();
      setStats(data);
    } catch {
      // Stats fetch failure is non-critical — leave null
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setListLoading(true);
    try {
      const params: {
        page: number;
        page_size: number;
        tipo?: string;
        prioridad?: string;
        visto?: boolean;
      } = { page, page_size: PAGE_SIZE };

      if (tipoFilter !== 'ALL') params.tipo = tipoFilter;
      if (prioridadFilter !== 'ALL') params.prioridad = prioridadFilter;
      if (vistoFilter !== 'ALL') params.visto = vistoFilter === 'true';

      const data = await notificationsService.getAll(params);
      setNotifications(data.results);
      setTotal(data.count);
      setHasNext(data.next !== null && data.next !== undefined);
      setHasPrevious(data.previous !== null && data.previous !== undefined);
    } catch {
      toast.error('Error al cargar las notificaciones.');
    } finally {
      setListLoading(false);
    }
  }, [page, tipoFilter, prioridadFilter, vistoFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkAsRead(id: number) {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, visto: true } : n)),
      );
      setStats((prev) =>
        prev
          ? { ...prev, sin_leer: Math.max(0, prev.sin_leer - 1), leidas: prev.leidas + 1 }
          : prev,
      );
    } catch {
      toast.error('No se pudo marcar como leída.');
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      toast.success('Todas las notificaciones han sido marcadas como leídas.');
      await Promise.all([fetchStats(), fetchNotifications()]);
    } catch {
      toast.error('Error al marcar todas como leídas.');
    } finally {
      setMarkingAll(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy flex items-center gap-3">
            <Bell size={28} className="text-primary-navy" />
            Centro de Notificaciones
          </h1>
          <p className="text-gray-500 mt-1">
            {listLoading
              ? 'Cargando...'
              : `${total} notificacion${total !== 1 ? 'es' : ''} encontrada${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={handleMarkAllAsRead}
          disabled={markingAll || (stats?.sin_leer ?? 0) === 0}
          className="bg-primary-navy hover:bg-primary-navy/90 text-white self-start md:self-auto"
        >
          {markingAll ? 'Marcando...' : 'Marcar todas como leídas'}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <>
            <StatCard label="Total" value={stats?.total ?? 0} colorClass="text-primary-navy" />
            <StatCard label="Sin leer" value={stats?.sin_leer ?? 0} colorClass="text-blue-600" />
            <StatCard label="Urgentes" value={stats?.urgentes ?? 0} colorClass="text-red-600" />
            <StatCard label="Leídas" value={stats?.leidas ?? 0} colorClass="text-green-600" />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Select value={tipoFilter} onValueChange={handleFilterChange(setTipoFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Tipo de notificación" />
          </SelectTrigger>
          <SelectContent>
            {TIPO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={prioridadFilter} onValueChange={handleFilterChange(setPrioridadFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            {PRIORIDAD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={vistoFilter} onValueChange={handleFilterChange(setVistoFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Estado de lectura" />
          </SelectTrigger>
          <SelectContent>
            {VISTO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications list */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell size={18} className="text-primary-navy" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {listLoading ? (
            <NotificationCardSkeleton />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Bell size={48} className="text-gray-200" />
              <p className="text-base font-medium">No hay notificaciones</p>
              <p className="text-sm">Cuando recibas notificaciones aparecerán aquí.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={[
                  'rounded-xl border border-gray-100 bg-white p-4 flex gap-4 transition-colors',
                  getPriorityBorderClass(n.prioridad),
                  !n.visto ? 'bg-blue-50/30' : '',
                ].join(' ')}
              >
                {/* Unread dot */}
                <div className="pt-1 shrink-0">
                  {!n.visto ? (
                    <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
                  ) : (
                    <span className="block h-2.5 w-2.5 rounded-full bg-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{n.asunto}</p>
                  {n.cuerpo && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {n.cuerpo}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getTypeBadgeClass(n.tipo)}`}
                    >
                      {NOTIFICATION_TYPE_LABELS[n.tipo] ?? n.tipo}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityBadgeClass(n.prioridad)}`}
                    >
                      {NOTIFICATION_PRIORITY_LABELS[n.prioridad] ?? n.prioridad}
                    </span>
                    <span className="text-xs text-gray-400">{n.tiempo_transcurrido}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-start">
                  {!n.visto && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-primary-navy hover:bg-blue-50 whitespace-nowrap"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Marcar leída
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!listLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Pagina {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
              className="gap-1"
            >
              <ChevronLeft size={14} /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="gap-1"
            >
              Siguiente <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
