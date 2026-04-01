import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, FileText, Globe, GraduationCap } from 'lucide-react';
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
import { secretaryAdminService } from '../services/secretary-admin.service';
import type { SecretaryStats } from '../services/secretary-admin.service';
import type { SecretaryDocProcedure } from '../types/secretary-doc.types';
import { StateBadge } from '@/components/StateBadge';

const STUDY_TYPE_LABELS: Record<string, string> = {
  PREGRADO: 'Pregrado',
  POSGRADO: 'Posgrado',
};

const VISIBILITY_LABELS: Record<string, string> = {
  NACIONAL: 'Nacional',
  INTERNACIONAL: 'Internacional',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ label, value, icon, isLoading }: StatCardProps) {
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ShadcnTableRow key={i}>
          <ShadcnTableCell><Skeleton className="h-4 w-32" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-20" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-6 w-24 rounded-full" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-6 w-20 rounded-full" /></ShadcnTableCell>
          <ShadcnTableCell><Skeleton className="h-4 w-24" /></ShadcnTableCell>
        </ShadcnTableRow>
      ))}
    </>
  );
}

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<SecretaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [recent, setRecent] = useState<SecretaryDocProcedure[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await secretaryAdminService.getStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStatsError('No se pudieron cargar las estadísticas.');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    async function fetchRecent() {
      setRecentLoading(true);
      setRecentError(null);
      try {
        const data = await secretaryAdminService.getProcedures({
          page_size: 10,
          ordering: '-created_at',
        });
        if (!cancelled) setRecent(data.results);
      } catch {
        if (!cancelled) setRecentError('No se pudieron cargar los trámites recientes.');
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    }

    fetchStats();
    fetchRecent();

    return () => {
      cancelled = true;
    };
  }, []);

  const pendientesCount =
    stats?.por_estado
      .filter((e) => ['ENVIADO', 'REQUIERE_INFO'].includes(e.state))
      .reduce((acc, e) => acc + e.total, 0) ?? 0;

  const enProcesoCount =
    stats?.por_estado.find((e) => e.state === 'EN_PROCESO')?.total ?? 0;

  const completadosCount =
    stats?.por_estado
      .filter((e) => ['APROBADO', 'FINALIZADO'].includes(e.state))
      .reduce((acc, e) => acc + e.total, 0) ?? 0;

  const statCards = [
    {
      label: 'Total Tramites',
      value: stats?.total_tramites ?? 0,
      icon: <FileText size={20} />,
    },
    {
      label: 'Pendientes',
      value: pendientesCount,
      icon: <Clock size={20} />,
    },
    {
      label: 'En Proceso',
      value: enProcesoCount,
      icon: <GraduationCap size={20} />,
    },
    {
      label: 'Completados',
      value: completadosCount,
      icon: <CheckCircle size={20} />,
    },
  ];

  const quickLinks = [
    {
      label: 'Pregrado Nacional',
      href: '/secretary/procedures?study_type=PREGRADO&visibility_type=NACIONAL',
      icon: <GraduationCap size={16} />,
    },
    {
      label: 'Pregrado Internacional',
      href: '/secretary/procedures?study_type=PREGRADO&visibility_type=INTERNACIONAL',
      icon: <Globe size={16} />,
    },
    {
      label: 'Posgrado Nacional',
      href: '/secretary/procedures?study_type=POSGRADO&visibility_type=NACIONAL',
      icon: <GraduationCap size={16} />,
    },
    {
      label: 'Posgrado Internacional',
      href: '/secretary/procedures?study_type=POSGRADO&visibility_type=INTERNACIONAL',
      icon: <Globe size={16} />,
    },
    {
      label: 'Todos los Tramites',
      href: '/secretary/procedures',
      icon: <FileText size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary-navy">Panel de Secretaria Docente</h1>

      {statsError && <ErrorMessage message={statsError} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            isLoading={statsLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="group flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-primary-navy opacity-60">{link.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-navy">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-primary-navy">Tramites Recientes</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700">
            <Link to="/secretary/procedures">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentError && (
            <div className="p-4">
              <ErrorMessage message={recentError} />
            </div>
          )}
          {!recentError && (
            <ShadcnTable>
              <ShadcnTableHeader>
                <ShadcnTableRow className="hover:bg-transparent">
                  <ShadcnTableHead className="pl-6">Solicitante</ShadcnTableHead>
                  <ShadcnTableHead>CI</ShadcnTableHead>
                  <ShadcnTableHead>Tipo</ShadcnTableHead>
                  <ShadcnTableHead>Estado</ShadcnTableHead>
                  <ShadcnTableHead>Fecha</ShadcnTableHead>
                </ShadcnTableRow>
              </ShadcnTableHeader>
              <ShadcnTableBody>
                {recentLoading ? (
                  <TableSkeleton />
                ) : recent.length === 0 ? (
                  <ShadcnTableRow>
                    <ShadcnTableCell colSpan={5} className="py-10 text-center text-sm text-gray-400">
                      No hay trámites recientes.
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ) : (
                  recent.map((proc) => (
                    <ShadcnTableRow key={proc.id}>
                      <ShadcnTableCell className="pl-6 font-medium text-gray-800">
                        {proc.full_name}
                      </ShadcnTableCell>
                      <ShadcnTableCell className="text-sm text-gray-500 font-mono">
                        {proc.id_card}
                      </ShadcnTableCell>
                      <ShadcnTableCell className="text-sm text-gray-600">
                        {STUDY_TYPE_LABELS[proc.study_type] ?? proc.study_type}{' '}
                        {VISIBILITY_LABELS[proc.visibility_type] ?? proc.visibility_type}
                      </ShadcnTableCell>
                      <ShadcnTableCell>
                        <StateBadge state={proc.state} />
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
    </div>
  );
}
