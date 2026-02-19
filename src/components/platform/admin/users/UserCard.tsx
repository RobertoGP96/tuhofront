import type { UserProfile, UserRole } from '@/types/user';
import {
    CheckCircle2,
    Clock,
    Edit3,
    Hash,
    Mail,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import React from 'react';

interface UserCardProps {
  user: UserProfile;
  isAdmin?: boolean;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string | number) => void;
  onToggleStatus?: (id: string | number, isActive: boolean) => void;
}

const ROLE_CONFIG: Record<UserRole, { color: string; bg: string; label: string }> = {
  ADMIN: { color: 'text-red-600', bg: 'bg-red-50', label: 'Administrador' },
  STUDENT: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Estudiante' },
  PROFESSOR: { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Profesor' },
  STAFF: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Personal' },
  EXTERNAL: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Externo' },
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const role = ROLE_CONFIG[user.user_type] || ROLE_CONFIG.EXTERNAL;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.username} 
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-500 transition-all">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ring-2 ring-white ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
              {user.is_active ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${role.bg} ${role.color}`}>
            {role.label}
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-400 font-medium">@{user.username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-500">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium">{user.id_card}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium">Unido el {new Date(user.date_joined).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 mt-auto flex items-center justify-between">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(user)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleStatus?.(user.id, !user.is_active)}
              className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 ${
                user.is_active 
                  ? 'text-gray-400 hover:text-amber-600 hover:bg-white' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-white'
              }`}
              title={user.is_active ? "Desactivar" : "Activar"}
            >
              {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete?.(user.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <button className="text-xs font-black text-blue-600 hover:underline">
          Ver Perfil
        </button>
      </div>
    </div>
  );
};
