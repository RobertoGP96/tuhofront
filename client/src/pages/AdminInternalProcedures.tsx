import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { internalAdminService } from '@/services/internal-admin.service';
import type { InternalStats } from '@/types/internal.types';
import { Utensils, BedDouble, Bus, Wrench } from 'lucide-react';
import { FeedingTab } from './admin-internal/FeedingTab';
import { AccommodationTab } from './admin-internal/AccommodationTab';
import { TransportTab } from './admin-internal/TransportTab';
import { MaintenanceTab } from './admin-internal/MaintenanceTab';

interface StatSummaryCard {
  label: string;
  type: string;
  icon: React.ReactNode;
}

const STAT_CARDS: StatSummaryCard[] = [
  { label: 'Alimentacion', type: 'feeding', icon: <Utensils size={20} /> },
  { label: 'Hospedaje', type: 'accommodation', icon: <BedDouble size={20} /> },
  { label: 'Transporte', type: 'transport', icon: <Bus size={20} /> },
  { label: 'Mantenimiento', type: 'maintenance', icon: <Wrench size={20} /> },
];

interface StatsMap {
  feeding: InternalStats | null;
  accommodation: InternalStats | null;
  transport: InternalStats | null;
  maintenance: InternalStats | null;
}

function SummaryCard({
  label,
  total,
  icon,
  isLoading,
}: {
  label: string;
  total: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start gap-3">
      <div className="mt-1 text-primary-navy opacity-60">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold">{label}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-12 mt-1" />
        ) : (
          <p className="text-2xl font-black text-primary-navy">{total}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminInternalProcedures() {
  const [stats, setStats] = useState<StatsMap>({
    feeding: null,
    accommodation: null,
    transport: null,
    maintenance: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      try {
        const [feeding, accommodation, transport, maintenance] = await Promise.allSettled([
          internalAdminService.getInternalStats('feeding'),
          internalAdminService.getInternalStats('accommodation'),
          internalAdminService.getInternalStats('transport'),
          internalAdminService.getInternalStats('maintance'),
        ]);

        if (cancelled) return;

        setStats({
          feeding: feeding.status === 'fulfilled' ? feeding.value : null,
          accommodation: accommodation.status === 'fulfilled' ? accommodation.value : null,
          transport: transport.status === 'fulfilled' ? transport.value : null,
          maintenance: maintenance.status === 'fulfilled' ? maintenance.value : null,
        });
      } catch {
        if (!cancelled) toast.error('Error al cargar las estadísticas.');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTotal = (key: keyof StatsMap): number => stats[key]?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Tramites Internos</h1>
        <p className="text-gray-500 mt-1">Gestion de tramites internos de la universidad</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <SummaryCard
            key={card.type}
            label={card.label}
            total={getTotal(card.type as keyof StatsMap)}
            icon={card.icon}
            isLoading={statsLoading}
          />
        ))}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="feeding">
            <TabsList className="mb-6">
              <TabsTrigger value="feeding">Alimentacion</TabsTrigger>
              <TabsTrigger value="accommodation">Hospedaje</TabsTrigger>
              <TabsTrigger value="transport">Transporte</TabsTrigger>
              <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            </TabsList>

            <TabsContent value="feeding">
              <FeedingTab />
            </TabsContent>

            <TabsContent value="accommodation">
              <AccommodationTab />
            </TabsContent>

            <TabsContent value="transport">
              <TransportTab />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
