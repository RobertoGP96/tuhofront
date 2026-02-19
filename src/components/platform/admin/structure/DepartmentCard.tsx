import type { DepartmentListItem } from '@/types/department';
import { Briefcase, Edit3, Layers, Trash2 } from 'lucide-react';
import React from 'react';

interface DepartmentCardProps {
  department: DepartmentListItem;
  isAdmin?: boolean;
  onEdit?: (department: DepartmentListItem) => void;
  onDelete?: (id: string) => void;
  onView?: (department: DepartmentListItem) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  isAdmin,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${department.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
          <Briefcase className="w-6 h-6" />
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          department.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {department.is_active ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      <div className="flex-grow">
        <div className="text-xs font-medium text-indigo-600 mb-1">{department.code}</div>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
          {department.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Layers className="w-4 h-4 text-gray-400" />
            <span>{department.total_areas} Áreas</span>
          </div>
          {department.manager_name && (
            <div className="text-sm text-gray-500 italic">
              Encargado: {department.manager_name}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-6">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(department)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(department.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={() => onView?.(department)}
          className="text-indigo-600 text-sm font-bold hover:underline"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};
