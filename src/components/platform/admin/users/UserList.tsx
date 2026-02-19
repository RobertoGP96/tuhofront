import { useUserMutations, useUsers } from '@/hooks/platform/use-users';
import type { UserProfile } from '@/types/user';
import { AlertCircle, Filter, LayoutGrid, List, Loader2, Search, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { UserCard } from './UserCard';
import { UserRow } from './UserRow';

interface UserListProps {
  isAdmin?: boolean;
  onEdit?: (user: UserProfile) => void;
  onAdd?: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  isAdmin,
  onEdit,
  onAdd,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { data, isLoading, isError, refetch } = useUsers({ 
    page, 
    page_size: pageSize,
    search 
  });

  const { deleteUser, toggleUserStatus } = useUserMutations();

  const handleToggleStatus = async (id: string | number, isActive: boolean) => {
    try {
      await toggleUserStatus.mutateAsync({ id, isActive });
    } catch (err) {
      alert('Error al actualizar el estado del usuario');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (err) {
        alert('Error al eliminar el usuario');
      }
    }
  };

  const users = data?.results || [];
  const total = data?.count || 0;

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Cargando usuarios...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar datos</h3>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o carnet..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-medium"
              value={search}
              onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
              }}
            />
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm sm:shadow-none">
              <Filter className="w-4 h-4" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => { setViewMode('grid'); setPageSize(8); }}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewMode('table'); setPageSize(10); }}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isAdmin && onAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5" />
            <span>Añadir Nuevo</span>
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No se encontraron usuarios</h3>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user, index) => (
            <div 
              key={user.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <UserCard
                user={user}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex items-center px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                <div className="flex-1 min-w-[300px] text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</div>
                <div className="flex-1 min-w-[200px] hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto / ID</div>
                <div className="w-24 shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</div>
                <div className="w-32 hidden lg:block shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</div>
                <div className="w-[124px] shrink-0 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</div>
              </div>
              <div className="divide-y divide-gray-100">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all active:scale-95 ${
                  page === i + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:bg-white hover:text-blue-600 border border-transparent'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={page === Math.ceil(total / pageSize)}
            onClick={() => setPage(prev => prev + 1)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
