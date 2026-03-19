import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { localsService } from '@/services/locals.service';
import type { LocalListItem, LocalType } from '@/types/locals.types';

const TYPE_LABELS: Record<LocalType | 'ALL', string> = {
  ALL: 'Todos los tipos',
  AULA: 'Aula',
  LABORATORIO: 'Laboratorio',
  AUDITORIO: 'Auditorio',
  SALA_REUNIONES: 'Sala de Reuniones',
  BIBLIOTECA: 'Biblioteca',
  GIMNASIO: 'Gimnasio',
  CAFETERIA: 'Cafetería',
  OTRO: 'Otro',
};

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

function LocalCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function LocalCard({ local, onClick }: { local: LocalListItem; onClick: () => void }) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border border-gray-200"
      onClick={onClick}
    >
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {local.image ? (
          <img
            src={local.image}
            alt={local.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building2 size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              local.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {local.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-primary-navy text-sm leading-snug group-hover:text-secondary-lime transition-colors line-clamp-2 mb-1">
          {local.name}
        </h3>
        <p className="text-xs text-gray-400 font-mono mb-2">{local.code}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              TYPE_BADGE_CLASSES[local.local_type]
            }`}
          >
            {local.local_type_display}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            {local.capacity}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LocalsCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [locals, setLocals] = useState<LocalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const typeParam = (searchParams.get('type') as LocalType | null) ?? 'ALL';
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedType, setSelectedType] = useState<LocalType | 'ALL'>(typeParam as LocalType | 'ALL');
  const [onlyActive, setOnlyActive] = useState(false);

  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchLocals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ...(selectedType !== 'ALL' && { local_type: selectedType }),
        ...(search && { search }),
        ...(onlyActive && { is_active: true }),
      };
      const data = await localsService.getLocals(params);
      setLocals(data.results);
      setTotalCount(data.count);
    } catch {
      setLocals([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, search, onlyActive]);

  useEffect(() => {
    fetchLocals();
  }, [fetchLocals]);

  // Sync type from URL param on mount
  useEffect(() => {
    const t = searchParams.get('type') as LocalType | null;
    if (t) setSelectedType(t);
  }, []);

  function handleTypeChange(val: string) {
    const v = val as LocalType | 'ALL';
    setSelectedType(v);
    setPage(1);
    if (v !== 'ALL') {
      setSearchParams((prev) => { prev.set('type', v); return prev; });
    } else {
      setSearchParams((prev) => { prev.delete('type'); return prev; });
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters bar */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de local" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABELS) as (LocalType | 'ALL')[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {TYPE_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => { setOnlyActive(e.target.checked); setPage(1); }}
              className="accent-primary-navy"
            />
            Solo activos
          </label>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-navy">Locales Universitarios</h1>
          {!loading && (
            <span className="text-xs text-gray-400 font-medium">
              {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LocalCardSkeleton key={i} />
            ))}
          </div>
        ) : locals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Building2 size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No se encontraron locales</p>
            <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locals.map((local) => (
              <LocalCard
                key={local.id}
                local={local}
                onClick={() => navigate(`/locals/${local.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
