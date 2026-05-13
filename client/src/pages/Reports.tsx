import {
  BarChart3,
  BedDouble,
  Bus,
  Building2,
  FileBarChart,
  FileText,
  GraduationCap,
  History,
  Utensils,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { ExportReportButton } from '@/components/reports/ExportReportButton';
import { useAuth } from '@/hooks/useAuth';
import {
  reportsService,
  type InternalDomain,
  type ReportFilters,
} from '@/services/reports.service';

type ReportKind =
  | 'admin-overview'
  | 'internal-feeding'
  | 'internal-accommodation'
  | 'internal-transport'
  | 'internal-maintenance'
  | 'procedures'
  | 'reservations'
  | 'secretary'
  | 'my-history';

interface ReportCardDef {
  kind: ReportKind;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind classes para el bloque del icono
  handler: (filters: ReportFilters) => Promise<void>;
  buttonLabel?: string;
}

const INTERNAL_DOMAINS: { domain: InternalDomain; title: string; icon: LucideIcon; accent: string }[] = [
  { domain: 'feeding', title: 'Alimentación', icon: Utensils, accent: 'bg-amber-50 text-amber-600' },
  { domain: 'accommodation', title: 'Hospedaje', icon: BedDouble, accent: 'bg-blue-50 text-blue-600' },
  { domain: 'transport', title: 'Transporte', icon: Bus, accent: 'bg-emerald-50 text-emerald-600' },
  { domain: 'maintenance', title: 'Mantenimiento', icon: Wrench, accent: 'bg-orange-50 text-orange-600' },
];

function buildReports(auth: ReturnType<typeof useAuth>): ReportCardDef[] {
  const list: ReportCardDef[] = [];

  if (auth.isAdmin) {
    list.push({
      kind: 'admin-overview',
      title: 'Reporte Institucional Global',
      description: 'Visión consolidada de todos los trámites, reservas y usuarios.',
      icon: BarChart3,
      accent: 'bg-primary-navy/5 text-primary-navy',
      handler: (f) => reportsService.downloadAdminOverview(f),
    });
  }

  // Trámites internos por dominio (Admin + GESTOR_INTERNO)
  if (auth.isAdmin || auth.isGestorInterno) {
    for (const d of INTERNAL_DOMAINS) {
      list.push({
        kind: `internal-${d.domain}` as ReportKind,
        title: `Trámites — ${d.title}`,
        description: `Estados, tendencia mensual y detalle de trámites de ${d.title.toLowerCase()}.`,
        icon: d.icon,
        accent: d.accent,
        handler: (f) => reportsService.downloadInternalDomain(d.domain, f),
      });
    }
  }

  // Trámites externos (Admin + GESTOR_TRAMITES)
  if (auth.isAdmin || auth.isGestorTramites) {
    list.push({
      kind: 'procedures',
      title: 'Trámites',
      description: 'Trámites externos consolidados: estados, tendencia y detalle.',
      icon: FileText,
      accent: 'bg-cyan-50 text-cyan-600',
      handler: (f) => reportsService.downloadProcedures(f),
    });
  }

  // Reservas (Admin + GESTOR_RESERVAS)
  if (auth.isAdmin || auth.isGestorReservas) {
    list.push({
      kind: 'reservations',
      title: 'Reservas de Locales',
      description: 'Top locales, distribución por estado y listado de reservas.',
      icon: Building2,
      accent: 'bg-violet-50 text-violet-600',
      handler: (f) => reportsService.downloadReservations(f),
    });
  }

  // Secretaría Docente
  if (auth.isAdmin || auth.canManageSecretary) {
    list.push({
      kind: 'secretary',
      title: 'Secretaría Docente',
      description: 'Documentos por tipo, estado y detalle por usuario.',
      icon: GraduationCap,
      accent: 'bg-pink-50 text-pink-600',
      handler: (f) => reportsService.downloadSecretary(f),
    });
  }

  // Mi historial — usuarios "personales" (no gestores). Admin lo conserva por compatibilidad.
  if (auth.isPersonalUser || auth.isAdmin) {
    list.push({
      kind: 'my-history',
      title: 'Mi Historial Personal',
      description: 'Tus trámites y reservas consolidados con KPIs y filtros.',
      icon: History,
      accent: 'bg-slate-100 text-slate-700',
      handler: (f) => reportsService.downloadMyHistory(f),
      buttonLabel: 'Descargar mi historial',
    });
  }

  return list;
}

function ReportCard({ def }: { def: ReportCardDef }) {
  const [loading, setLoading] = useState(false);
  const Icon = def.icon;

  async function quickDownload() {
    setLoading(true);
    try {
      await def.handler({});
      toast.success('Reporte generado correctamente');
    } catch (err) {
      const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
      toast.error(status === 403 ? 'Sin permiso para este reporte' : 'No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${def.accent}`}>
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-primary-navy">{def.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{def.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={quickDownload}
            disabled={loading}
            className="flex-1 text-xs font-semibold text-primary-navy hover:bg-accent rounded-lg py-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Descarga rápida'}
          </button>
          <ExportReportButton
            label={def.buttonLabel ?? 'Con filtros'}
            onExport={def.handler}
            size="sm"
            variant="outline"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const auth = useAuth();
  const reports = buildReports(auth);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-navy text-white flex items-center justify-center">
          <FileBarChart size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Reportes</h1>
          <p className="text-gray-500 mt-1">
            Genera y descarga reportes PDF con el branding institucional.
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-8 text-center text-gray-400">
            No tienes reportes disponibles para tu perfil.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <ReportCard key={r.kind} def={r} />
          ))}
        </div>
      )}

      <Card className="border-gray-100 shadow-sm bg-accent/40">
        <CardContent className="p-4 text-xs text-gray-500 flex items-start gap-2">
          <FileBarChart size={14} className="mt-0.5 text-primary-navy" />
          <p>
            <strong className="text-primary-navy">Tip:</strong> los reportes pueden filtrarse por
            rango de fechas, estado y tipo. La "Descarga rápida" omite los filtros y exporta todo
            el historial accesible para tu rol.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
