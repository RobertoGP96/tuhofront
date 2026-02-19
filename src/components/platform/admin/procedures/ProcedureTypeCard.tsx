import type { ProcedureType } from '@/types/procedure';
import {
    ChevronRight,
    FileCheck,
    Settings,
    ShieldCheck
} from 'lucide-react';
import React from 'react';

interface ProcedureTypeCardProps {
  type: ProcedureType;
  isAdmin?: boolean;
  onView?: (type: ProcedureType) => void;
}

export const ProcedureTypeCard: React.FC<ProcedureTypeCardProps> = ({
  type,
  onView,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
            <Settings className="w-6 h-6" />
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            type.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {type.is_active ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {type.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
          {type.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{type.requires_approval ? 'Requiere Firma' : 'Auto-aprobado'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase">
            <FileCheck className="w-3.5 h-3.5" />
            <span>{type.required_documents?.length || 0} Documentos</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 mt-auto">
        <button
          onClick={() => onView?.(type)}
          className="w-full py-2.5 bg-white border border-gray-200 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
        >
          Ver Configuración
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
