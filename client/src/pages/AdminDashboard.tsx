import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from '@/components/ui/table';
import { AlertCircle, BedDouble, Building2, Bus, CheckCircle, Clock, FileText, GraduationCap, Newspaper, Settings, Utensils, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { AdminProcedure, AdminStats } from '../services/admin.service';
import { localsService } from '../services/locals.service';
import { secretaryAdminService } from '../services/secretary-admin.service';
import type { SecretaryStats } from '../services/secretary-admin.service';
import type { User } from '../types/auth.types';
import { USER_TYPE_LABELS } from '@/lib/constants';
import { StateBadge } from '@/components/StateBadge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatsCard({ label, value, icon, isLoading }: StatCard) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start gap-3">
      <div className="mt-1 text-primary-navy opacity-60">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold">{label}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-black text-primary-navy">{value}</p>
        )}
      </div>
    </div>
  );
}

function ProceduresTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ShadcnTableRow key={i}>
          <ShadcnTableCell><Skeleton className="h-4 w-32" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-6 w-28 rounded-full" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-28" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-24" /></ShadcnTableCell>
        </ShadcnTableRow>
      ))}
    </>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [procedures, setProcedures] = useState<AdminProcedure[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [proceduresError, setProceduresError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [pendingReservations, setPendingReservations] = useState(0);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [secretaryStats, setSecretaryStats] = useState<SecretaryStats | null>(null);
  const [secretaryLoading, setSecretaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await adminService.getStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStatsError('No se pudieron cargar las estadisticas.');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    async function fetchProcedures() {
      setProceduresLoading(true);
      setProceduresError(null);
      try {
        const data = await adminService.getRecentProcedures(5);
        if (!cancelled) setProcedures(data.results);
      } catch {
        if (!cancelled) setProceduresError('No se pudieron cargar los tramites recientes.');
      } finally {
        if (!cancelled) setProceduresLoading(false);
      }
    }

    async function fetchUsers() {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await adminService.getRecentUsers(5);
        if (!cancelled) setUsers(data.results);
      } catch {
        if (!cancelled) setUsersError('No se pudieron cargar los usuarios recientes.');
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    }

    async function fetchReservations() {
      setReservationsLoading(true);
      try {
        const data = await localsService.getPendingReservations();
        if (!cancelled) setPendingReservations(data.length);
      } catch {
        if (!cancelled) setPendingReservations(0);
      } finally {
        if (!cancelled) setReservationsLoading(false);
      }
    }

    async function fetchSecretaryStats() {
      setSecretaryLoading(true);
      try {
        const data = await secretaryAdminService.getStats();
        if (!cancelled) setSecretaryStats(data);
      } catch {
        if (!cancelled) setSecretaryStats(null);
      } finally {
        if (!cancelled) setSecretaryLoading(false);
      }
    }

    fetchStats();
    fetchProcedures();
    fetchUsers();
    fetchReservations();
    fetchSecretaryStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const safeNum = (val: unknown): number => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const statCards = [
    {
      label: 'Total Tramites',
      value: stats ? safeNum(stats.total_procedures) : 0,
      icon: <FileText size={20} />,
    },
    {
      label: 'Pendientes',
      value: stats ? safeNum(stats.pending_procedures) : 0,
      icon: <Clock size={20} />,
    },
    {
      label: 'Completados',
      value: stats ? safeNum(stats.completed_procedures) : 0,
      icon: <CheckCircle size={20} />,
    },
    {
      label: 'Usuarios Activos',
      value: stats ? safeNum(stats.active_users) : 0,
      icon: <Users size={20} />,
    },
  ];

  function getUserDisplayName(user: User): string {
    const full = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return full || user.username;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary-navy">Panel de Control</h1>

      {statsError && <ErrorMessage message={statsError} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            isLoading={statsLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard
          label="Reservas Pendientes"
          value={pendingReservations}
          icon={<Building2 size={20} />}
          isLoading={reservationsLoading}
        />
        <StatsCard
          label="Trámites Secretaría"
          value={safeNum(secretaryStats?.total_tramites)}
          icon={<GraduationCap size={20} />}
          isLoading={secretaryLoading}
        />
        {secretaryStats?.por_tipo_estudio && secretaryStats.por_tipo_estudio.length > 0 && (
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold mb-3">Desglose Secretaría</p>
            <div className="space-y-2">
              {secretaryStats.por_tipo_estudio.map((item) => (
                <div key={item.study_type} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.study_type === 'PREGRADO' ? 'Pregrado' : 'Posgrado'}</span>
                  <span className="font-bold text-primary-navy">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/internal"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <FileText size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Tramites Internos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-primary-navy opacity-60">
              <Utensils size={16} />
              <BedDouble size={16} />
              <Bus size={16} />
              <Wrench size={16} />
            </div>
          </div>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Gestionar tramites &rarr;
          </p>
        </Link>

        <Link
          to="/admin/areas"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <Building2 size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Areas
            </span>
          </div>
          <p className="text-xs text-gray-500">Departamentos y areas organizacionales</p>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Gestionar areas &rarr;
          </p>
        </Link>

        <Link
          to="/admin/news"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <Newspaper size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Noticias
            </span>
          </div>
          <p className="text-xs text-gray-500">Publicaciones y anuncios del portal</p>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Gestionar noticias &rarr;
          </p>
        </Link>

        <Link
          to="/admin/locals"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <Building2 size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Locales
            </span>
          </div>
          <p className="text-xs text-gray-500">Aulas, laboratorios y reservas de espacios</p>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Gestionar locales &rarr;
          </p>
        </Link>

        <Link
          to="/admin/settings"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <Settings size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Configuracion
            </span>
          </div>
          <p className="text-xs text-gray-500">Tipos de transporte, mantenimiento y prioridades</p>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Configurar sistema &rarr;
          </p>
        </Link>

        <Link
          to="/admin/locals"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <Building2 size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Reservas
            </span>
          </div>
          {pendingReservations > 0 && (
            <p className="text-xs text-amber-600 font-medium">
              {pendingReservations} pendiente{pendingReservations !== 1 ? 's' : ''}
            </p>
          )}
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Ver reservas &rarr;
          </p>
        </Link>

        <Link
          to="/secretary/procedures"
          className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-primary-navy">
            <GraduationCap size={18} className="opacity-70" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Secretaría
            </span>
          </div>
          <p className="text-xs text-gray-500">Trámites de secretaría docente</p>
          <p className="text-xs text-blue-600 font-medium group-hover:underline">
            Gestionar trámites &rarr;
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-primary-navy">Tramites Recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
              <Link to="/admin/procedures">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {proceduresError && <ErrorMessage message={proceduresError} />}
            {!proceduresError && (
              <ShadcnTable>
                <ShadcnTableHeader>
                  <ShadcnTableRow className="hover:bg-transparent">
                    <ShadcnTableHead className="w-[160px]"># Seguimiento</ShadcnTableHead>
                    <ShadcnTableHead>Estado</ShadcnTableHead>
                    <ShadcnTableHead>Usuario</ShadcnTableHead>
                    <ShadcnTableHead>Fecha</ShadcnTableHead>
                  </ShadcnTableRow>
                </ShadcnTableHeader>
                <ShadcnTableBody>
                  {proceduresLoading ? (
                    <ProceduresTableSkeleton />
                  ) : procedures.length === 0 ? (
                    <ShadcnTableRow>
                      <ShadcnTableCell colSpan={4} className="py-10 text-center text-sm text-gray-400">
                        No hay tramites recientes.
                      </ShadcnTableCell>
                    </ShadcnTableRow>
                  ) : (
                    procedures.map((proc) => (
                      <ShadcnTableRow key={proc.id}>
                        <ShadcnTableCell className="font-mono text-sm font-medium text-gray-600">
                          {proc.follow_number}
                        </ShadcnTableCell>
                        <ShadcnTableCell>
                          <StateBadge state={proc.state} />
                        </ShadcnTableCell>
                        <ShadcnTableCell className="text-sm text-gray-500">
                          {proc.user_full_name ?? `Usuario #${proc.user}`}
                        </ShadcnTableCell>
                        <ShadcnTableCell className="text-sm text-gray-500">
                          {formatDate(proc.created_at)}
                        </ShadcnTableCell>
                      </ShadcnTableRow>
                    ))
                  )}
                </ShadcnTableBody>
              </ShadcnTable>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-primary-navy">Usuarios Recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
              <Link to="/admin/users">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {usersError && <ErrorMessage message={usersError} />}
            {!usersError && (
              usersLoading ? (
                <UsersListSkeleton />
              ) : users.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">No hay usuarios recientes.</p>
              ) : (
                <ul className="space-y-3">
                  {users.map((user) => (
                    <li key={user.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-navy/10 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-primary-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.user_type ? (USER_TYPE_LABELS[user.user_type] ?? user.user_type) : '—'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
