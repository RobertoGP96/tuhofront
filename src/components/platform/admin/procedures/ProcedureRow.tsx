import type { ProcedureListItem, ProcedureState } from '@/types/procedure';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileCheck,
    FileText,
    MoreVertical,
    PauseCircle,
    XCircle
} from 'lucide-react';
import React from 'react';

interface ProcedureRowProps {
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
    label: 'Info Req.' 
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

export const ProcedureRow: React.FC<ProcedureRowProps> = ({
  procedure,
  isAdmin,
  onEdit,
  onView,
}) => {
  const config = STATE_CONFIG[procedure.state] || STATE_CONFIG.BORRADOR;
  const Icon = config.icon;
  const date = procedure.created_at ? format(new Date(procedure.created_at), "d MMM, yyyy", { locale: es }) : 'N/A';

  return (
    <div className="group bg-white hover:bg-gray-50/50 border-b border-gray-100 last:border-0 transition-all duration-200">
      <div className="flex items-center px-6 py-4 gap-6">
        {/* Folio & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className={`p-2 rounded-xl shrink-0 ${config.bg} ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Folio #{procedure.follow_number}
            </span>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {procedure.state_display || 'Solicitud de Trámite'}
            </h3>
          </div>
        </div>

        {/* Status */}
        <div className="w-32 shrink-0">
          <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Progress */}
        <div className="w-48 hidden md:flex shrink-0 flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-gray-400">Progreso</span>
            <span className="text-gray-900">{procedure.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${procedure.progress}%` }}
            />
          </div>
        </div>

        {/* Documents & Date */}
        <div className="w-40 hidden lg:flex shrink-0 items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Archivos</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <FileCheck className="w-3.5 h-3.5 text-gray-400" />
              {procedure.document_count}
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Creado</span>
            <span className="text-xs text-gray-700 font-medium">{date}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 min-w-[120px]">
          <button
            onClick={() => onView?.(procedure)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-90"
            title="Ver detalles"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => onEdit?.(procedure)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all active:scale-90"
              title="Gestionar"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
          
          <ChevronRight className="w-4 h-4 text-gray-300 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
