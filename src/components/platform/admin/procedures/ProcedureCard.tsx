import type { ProcedureListItem, ProcedureState } from '@/types/procedure';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    MoreVertical,
    PauseCircle,
    XCircle
} from 'lucide-react';
import React from 'react';

interface ProcedureCardProps {
  procedure: ProcedureListItem;
  isAdmin?: boolean;
  onEdit?: (procedure: ProcedureListItem) => void;
  onView?: (procedure: ProcedureListItem) => void;
}

const STATE_CONFIG: Record<ProcedureState, { color: string; bg: string; icon: any; label: string }> = {
  BORRADOR: { 
    color: 'text-gray-500', 
    bg: 'bg-gray-100', 
    icon: FileText, 
    label: 'Borrador' 
  },
  ENVIADO: { 
    color: 'text-blue-500', 
    bg: 'bg-blue-50', 
    icon: Clock, 
    label: 'Enviado' 
  },
  EN_PROCESO: { 
    color: 'text-amber-500', 
    bg: 'bg-amber-50', 
    icon: PauseCircle, 
    label: 'En Proceso' 
  },
  REQUIERE_INFO: { 
    color: 'text-purple-500', 
    bg: 'bg-purple-50', 
    icon: AlertCircle, 
    label: 'Requiere Info' 
  },
  APROBADO: { 
    color: 'text-green-500', 
    bg: 'bg-green-50', 
    icon: CheckCircle2, 
    label: 'Aprobado' 
  },
  RECHAZADO: { 
    color: 'text-red-500', 
    bg: 'bg-red-50', 
    icon: XCircle, 
    label: 'Rechazado' 
  },
  FINALIZADO: { 
    color: 'text-teal-500', 
    bg: 'bg-teal-50', 
    icon: CheckCircle2, 
    label: 'Finalizado' 
  },
};

export const ProcedureCard: React.FC<ProcedureCardProps> = ({
  procedure,
  isAdmin,
  onEdit,
  onView,
}) => {
  const config = STATE_CONFIG[procedure.state] || STATE_CONFIG.BORRADOR;
  const Icon = config.icon;
  const date = procedure.created_at ? format(new Date(procedure.created_at), "d MMM, yyyy", { locale: es }) : 'N/A';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${config.bg} ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Trámite #{procedure.follow_number}
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {procedure.state_display || 'Solicitud de Trámite'}
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-gray-400 uppercase">Progreso</span>
            <span className="text-gray-900">{procedure.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${procedure.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Creado</div>
            <div className="text-xs font-medium text-gray-700">{date}</div>
          </div>
          <div className="space-y-0.5 text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Documentos</div>
            <div className="text-xs font-medium text-gray-700">{procedure.document_count} archivos</div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-50 mt-auto flex items-center justify-between">
        <button
          onClick={() => onView?.(procedure)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group/btn"
        >
          Ver detalles
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
        
        {isAdmin && (
          <button
            onClick={() => onEdit?.(procedure)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
