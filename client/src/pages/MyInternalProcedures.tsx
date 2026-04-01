import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { feedingService, accommodationService, transportService, maintenanceService } from '@/services/internal.service';
import type {
  FeedingProcedure,
  AccommodationProcedure,
  TransportProcedure,
  MaintanceProcedure,
  InternalProcedureState,
} from '@/types/internal.types';
import {
  StateBadge,
  StateFilter,
  Pagination,
  TableSkeletonRows,
  EmptyRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './admin-internal/ProcedureTableShared';
import { formatDate, formatDateTime, PAGE_SIZE } from './admin-internal/constants';
import { Utensils, BedDouble, Bus, Wrench } from 'lucide-react';

const FEEDING_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurante',
  HOTELITO: 'Hotelito',
};

const ACCOMMODATION_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hotel',
  POSGRADO: 'Posgrado',
};

// ── Feeding Tab ───────────────────────────────────────────────────────────────

function FeedingUserTab() {
  const [items, setItems] = useState<FeedingProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    feedingService
      .getAll()
      .then((res) => {
        if (!cancelled) {
          setItems(res.results ?? (res as unknown as FeedingProcedure[]));
          setTotal(res.count ?? (res as unknown as FeedingProcedure[]).length);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = stateFilter === 'ALL' ? items : items.filter((i) => i.state === stateFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(val: InternalProcedureState | 'ALL') {
    setStateFilter(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StateFilter value={stateFilter} onChange={handleFilterChange} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={4} />
          ) : paged.length === 0 ? (
            <EmptyRow colSpan={5} message="No tienes solicitudes de alimentación." />
          ) : (
            paged.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{FEEDING_TYPE_LABELS[item.feeding_type] ?? item.feeding_type}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(item.start_day)} — {formatDate(item.end_day)}
                </TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell><StateBadge state={item.state} /></TableCell>
                <TableCell className="text-sm text-gray-400">{formatDate(item.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={page < totalPages}
        hasPrevious={page > 1}
        onNext={() => setPage((p) => p + 1)}
        onPrevious={() => setPage((p) => p - 1)}
      />
    </div>
  );
}

// ── Accommodation Tab ─────────────────────────────────────────────────────────

function AccommodationUserTab() {
  const [items, setItems] = useState<AccommodationProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    accommodationService
      .getAll()
      .then((res) => {
        if (!cancelled) setItems(res.results ?? (res as unknown as AccommodationProcedure[]));
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = stateFilter === 'ALL' ? items : items.filter((i) => i.state === stateFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(val: InternalProcedureState | 'ALL') {
    setStateFilter(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StateFilter value={stateFilter} onChange={handleFilterChange} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Huéspedes</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={4} />
          ) : paged.length === 0 ? (
            <EmptyRow colSpan={5} message="No tienes solicitudes de hospedaje." />
          ) : (
            paged.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{ACCOMMODATION_TYPE_LABELS[item.accommodation_type] ?? item.accommodation_type}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(item.start_day)} — {formatDate(item.end_day)}
                </TableCell>
                <TableCell>{Array.isArray(item.guests) ? item.guests.length : '—'}</TableCell>
                <TableCell><StateBadge state={item.state} /></TableCell>
                <TableCell className="text-sm text-gray-400">{formatDate(item.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={page < totalPages}
        hasPrevious={page > 1}
        onNext={() => setPage((p) => p + 1)}
        onPrevious={() => setPage((p) => p - 1)}
      />
    </div>
  );
}

// ── Transport Tab ─────────────────────────────────────────────────────────────

function TransportUserTab() {
  const [items, setItems] = useState<TransportProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    transportService
      .getAll()
      .then((res) => {
        if (!cancelled) setItems(res.results ?? (res as unknown as TransportProcedure[]));
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = stateFilter === 'ALL' ? items : items.filter((i) => i.state === stateFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(val: InternalProcedureState | 'ALL') {
    setStateFilter(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StateFilter value={stateFilter} onChange={handleFilterChange} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Origen → Destino</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Pasajeros</TableHead>
            <TableHead>I/V</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={5} />
          ) : paged.length === 0 ? (
            <EmptyRow colSpan={6} message="No tienes solicitudes de transporte." />
          ) : (
            paged.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm">
                  {item.departure_place} → {item.return_place}
                </TableCell>
                <TableCell className="text-sm text-gray-500">{formatDateTime(item.departure_time)}</TableCell>
                <TableCell>{item.passengers}</TableCell>
                <TableCell>{item.round_trip ? 'Sí' : 'No'}</TableCell>
                <TableCell><StateBadge state={item.state} /></TableCell>
                <TableCell className="text-sm text-gray-400">{formatDate(item.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={page < totalPages}
        hasPrevious={page > 1}
        onNext={() => setPage((p) => p + 1)}
        onPrevious={() => setPage((p) => p - 1)}
      />
    </div>
  );
}

// ── Maintenance Tab ───────────────────────────────────────────────────────────

function MaintenanceUserTab() {
  const [items, setItems] = useState<MaintanceProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<InternalProcedureState | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    maintenanceService
      .getAll()
      .then((res) => {
        if (!cancelled) setItems(res.results ?? (res as unknown as MaintanceProcedure[]));
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = stateFilter === 'ALL' ? items : items.filter((i) => i.state === stateFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(val: InternalProcedureState | 'ALL') {
    setStateFilter(val);
    setPage(1);
  }

  function getTypeName(pt: MaintanceProcedure['procedure_type']): string {
    if (typeof pt === 'object' && pt !== null) return pt.name;
    return String(pt);
  }

  function getPriorityName(p: MaintanceProcedure['priority']): string {
    if (typeof p === 'object' && p !== null) return p.name;
    return String(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StateFilter value={stateFilter} onChange={handleFilterChange} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tipo</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows cols={4} />
          ) : paged.length === 0 ? (
            <EmptyRow colSpan={5} message="No tienes solicitudes de mantenimiento." />
          ) : (
            paged.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{getTypeName(item.procedure_type)}</TableCell>
                <TableCell>{getPriorityName(item.priority)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-gray-500">
                  {item.description}
                </TableCell>
                <TableCell><StateBadge state={item.state} /></TableCell>
                <TableCell className="text-sm text-gray-400">{formatDate(item.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={page < totalPages}
        hasPrevious={page > 1}
        onNext={() => setPage((p) => p + 1)}
        onPrevious={() => setPage((p) => p - 1)}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyInternalProcedures() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Mis Trámites Internos</h1>
        <p className="text-gray-500 mt-1">Consulte el estado de sus solicitudes internas.</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="feeding">
            <TabsList className="mb-6">
              <TabsTrigger value="feeding" className="gap-2">
                <Utensils size={14} /> Alimentación
              </TabsTrigger>
              <TabsTrigger value="accommodation" className="gap-2">
                <BedDouble size={14} /> Hospedaje
              </TabsTrigger>
              <TabsTrigger value="transport" className="gap-2">
                <Bus size={14} /> Transporte
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench size={14} /> Mantenimiento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feeding">
              <FeedingUserTab />
            </TabsContent>
            <TabsContent value="accommodation">
              <AccommodationUserTab />
            </TabsContent>
            <TabsContent value="transport">
              <TransportUserTab />
            </TabsContent>
            <TabsContent value="maintenance">
              <MaintenanceUserTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
