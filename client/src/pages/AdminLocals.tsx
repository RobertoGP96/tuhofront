import { Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocalsTab } from './admin-locals/LocalsTab';
import { PendingReservationsTab } from './admin-locals/PendingReservationsTab';
import { AllReservationsTab } from './admin-locals/AllReservationsTab';

export default function AdminLocals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="text-primary-navy" size={28} />
        <h1 className="text-3xl font-bold text-primary-navy">Gestion de Locales</h1>
      </div>

      <Tabs defaultValue="locals">
        <TabsList className="mb-4">
          <TabsTrigger value="locals">Locales</TabsTrigger>
          <TabsTrigger value="pending">Reservas Pendientes</TabsTrigger>
          <TabsTrigger value="all">Todas las Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="locals">
          <LocalsTab />
        </TabsContent>

        <TabsContent value="pending">
          <PendingReservationsTab />
        </TabsContent>

        <TabsContent value="all">
          <AllReservationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
