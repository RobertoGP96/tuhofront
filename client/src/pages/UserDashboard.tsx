import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, FileText, Bell, ClipboardCheck, Utensils, Wrench, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useNotificationsPoll } from '../hooks/useNotificationsPoll';
import { proceduresService } from '@/services/procedures.service';
import { localsService } from '@/services/locals.service';
import { formatDate } from '@/utils';

interface QuickStat {
  label: string;
  value: number | string;
  hint: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  show: boolean;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, isProfesor, isTrabajador, isEstudiante, isExterno } = useAuth();
  const { unreadCount } = useNotificationsPoll();

  const [pendingProcedures, setPendingProcedures] = useState<number | null>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<number | null>(null);
  const [recentDeadline, setRecentDeadline] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await proceduresService.getProcedures({ page: 1 });
        if (cancelled) return;
        const pending = data.results.filter(
          (p) => p.state === 'ENVIADO' || p.state === 'EN_PROCESO' || p.state === 'REQUIERE_INFO',
        );
        setPendingProcedures(pending.length);
        const next = pending.find((p) => p.deadline);
        setRecentDeadline(next?.deadline ?? null);
      } catch {
        if (!cancelled) setPendingProcedures(0);
      }

      try {
        const upcoming = await localsService.getUpcomingReservations();
        if (!cancelled) setUpcomingReservations(upcoming.length);
      } catch {
        if (!cancelled) setUpcomingReservations(0);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = user?.first_name
    ? `Hola, ${user.first_name}`
    : 'Bienvenido a TUho';

  const stats: QuickStat[] = [
    {
      label: 'Trámites en proceso',
      value: pendingProcedures ?? '—',
      hint: pendingProcedures && pendingProcedures > 0 ? 'Revisá su estado' : 'Sin pendientes',
    },
    {
      label: 'Próximas reservas',
      value: upcomingReservations ?? '—',
      hint: upcomingReservations && upcomingReservations > 0 ? 'En tu agenda' : 'Ninguna programada',
    },
    {
      label: 'Notificaciones',
      value: unreadCount,
      hint: unreadCount > 0 ? 'Sin leer' : 'Al día',
    },
    {
      label: 'Próximo vencimiento',
      value: recentDeadline ? formatDate(recentDeadline) : '—',
      hint: recentDeadline ? 'Fecha límite de un trámite' : 'Sin fechas críticas',
    },
  ];

  const actions: QuickAction[] = [
    {
      title: 'Solicitar trámite docente',
      description: 'Constancia, certificación, legalización de título.',
      icon: GraduationCap,
      href: '/procedures/secretary/undergraduate/national',
      show: isEstudiante || isProfesor || isTrabajador,
    },
    {
      title: 'Solicitud de alimentación',
      description: 'Para visitas académicas y eventos.',
      icon: Utensils,
      href: '/procedures/internal/feeding',
      show: isProfesor || isTrabajador,
    },
    {
      title: 'Solicitud de mantenimiento',
      description: 'Reportar problemas en aulas, laboratorios u oficinas.',
      icon: Wrench,
      href: '/procedures/internal/maintenance',
      show: isProfesor || isTrabajador,
    },
    {
      title: 'Reservar un local',
      description: 'Aulas, auditorios, laboratorios, salas de reunión.',
      icon: Building2,
      href: '/locals/reserve',
      show: !isExterno,
    },
    {
      title: 'Ver mis trámites',
      description: 'Estado, seguimiento y observaciones.',
      icon: FileText,
      href: '/procedures',
      show: true,
    },
    {
      title: 'Mis reservas',
      description: 'Reservas activas, próximas e históricas.',
      icon: ClipboardCheck,
      href: '/locals/my-reservations',
      show: !isExterno,
    },
    {
      title: 'Noticias',
      description: 'Comunicados, convocatorias y avisos institucionales.',
      icon: BookOpen,
      href: '/news',
      show: true,
    },
    {
      title: 'Notificaciones',
      description: 'Avisos sobre tus trámites y reservas.',
      icon: Bell,
      href: '/notifications',
      show: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase text-primary-navy">{greeting}</h1>
        <p className="text-sm text-gray-500">
          Estos son tus accesos rápidos en la plataforma de trámites de la Universidad de Holguín.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-primary-navy mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions
            .filter((a) => a.show)
            .map((a) => {
              const Icon = a.icon;
              return (
                <Card
                  key={a.title}
                  className="border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-navy/20 transition-all cursor-pointer group"
                  onClick={() => navigate(a.href)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-navy/5 text-primary-navy flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary-navy text-sm">{a.title}</p>
                        {a.href === '/notifications' && unreadCount > 0 && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.description}</p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-primary-navy group-hover:translate-x-1 transition-all shrink-0 mt-1"
                    />
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </section>

      {/* Foot link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <Button variant="link" onClick={() => navigate('/profile')} className="text-primary-navy">
          Gestionar perfil
        </Button>
      </div>
    </div>
  );
}
