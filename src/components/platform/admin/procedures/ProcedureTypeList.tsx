import { useProcedureTypes } from '@/hooks/platform/use-procedures';
import type { ProcedureType } from '@/types/procedure';
import { AlertCircle, Loader2, Search, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { ProcedureTypeCard } from './ProcedureTypeCard';

interface ProcedureTypeListProps {
  isAdmin?: boolean;
  onView?: (type: ProcedureType) => void;
}

export const ProcedureTypeList: React.FC<ProcedureTypeListProps> = ({
  isAdmin,
  onView,
}) => {
  const [search, setSearch] = useState('');
  const { data: types, isLoading, isError, refetch } = useProcedureTypes();

  const filteredTypes = types?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Cargando catálogo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar tipos</h3>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en el catálogo..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">
          <span className="text-gray-900 font-bold">{filteredTypes.length}</span> tipos de trámites disponibles
        </div>
      </div>

      {filteredTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <Settings className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No se encontraron tipos</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTypes.map((type, index) => (
            <div key={type.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
              <ProcedureTypeCard
                type={type}
                isAdmin={isAdmin}
                onView={onView}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
