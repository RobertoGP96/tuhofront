import type { AreaListItem } from '@/types/area';
import { Building2, Edit3, MapPin, Trash2, Users } from 'lucide-react';
import React from 'react';

interface AreaCardProps {
  area: AreaListItem;
  isAdmin?: boolean;
  onEdit?: (area: AreaListItem) => void;
  onDelete?: (id: string) => void;
  onView?: (area: AreaListItem) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isAdmin,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${area.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
          <Building2 className="w-6 h-6" />
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          area.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {area.is_active ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      <div className="flex-grow">
        <div className="text-xs font-medium text-blue-600 mb-1">{area.code}</div>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {area.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1">{area.department_name}</span>
          </div>
          {area.manager_name && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="line-clamp-1">{area.manager_name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-6">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(area)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(area.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={() => onView?.(area)}
          className="text-blue-600 text-sm font-bold hover:underline"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};
