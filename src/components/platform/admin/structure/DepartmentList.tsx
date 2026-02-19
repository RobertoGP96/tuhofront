import { useDepartmentMutations, useDepartments } from '@/hooks/platform/use-departments';
import type { DepartmentFilterOptions, DepartmentListItem } from '@/types/department';
import { AlertCircle, Briefcase, Filter, Loader2, Search } from 'lucide-react';
import React, { useState } from 'react';
import { DepartmentCard } from './DepartmentCard';

interface DepartmentListProps {
  isAdmin?: boolean;
  onEdit?: (department: DepartmentListItem) => void;
  onView?: (department: DepartmentListItem) => void;
  initialFilters?: DepartmentFilterOptions;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  isAdmin,
  onEdit,
  onView,
  initialFilters = {},
}) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [filters, setFilters] = useState<DepartmentFilterOptions>(initialFilters);

  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useDepartments({ page, page_size: pageSize, ...filters });

  const { deleteDepartment } = useDepartmentMutations();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este departamento?')) {
      try {
        await deleteDepartment.mutateAsync(id);
      } catch (err) {
        alert('Error al eliminar el departamento');
      }
    }
  };

  const departments = data?.results || [];
  const total = data?.count || 0;

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Cargando departamentos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
        <p className="text-gray-500 mb-6 max-w-md">No se pudieron cargar los departamentos. Por favor, intente de nuevo.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar departamentos..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
            value={filters.search || ''}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="text-xs text-gray-400 font-medium">
             Mostrando <span className="text-gray-900 font-bold">{departments.length}</span> de <span className="text-gray-900 font-bold">{total}</span> departamentos
           </div>
           <button 
             className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
           >
             <Filter className="w-4 h-4" />
             Filtrar
           </button>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No se encontraron departamentos</h3>
          <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((item, index) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
              <DepartmentCard
                department={item}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={handleDelete}
                onView={onView}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Anterior
          </button>
          {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                page === i + 1
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-500 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === Math.ceil(total / pageSize)}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
