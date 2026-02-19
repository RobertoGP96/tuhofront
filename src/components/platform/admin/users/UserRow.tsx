import type { UserProfile, UserRole } from '@/types/user';
import {
    CheckCircle2,
    Edit3,
    Fingerprint,
    Mail,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import React from 'react';

interface UserRowProps {
  user: UserProfile;
  isAdmin?: boolean;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string | number) => void;
  onToggleStatus?: (id: string | number, isActive: boolean) => void;
}

const ROLE_CONFIG: Record<UserRole, { color: string; bg: string; label: string }> = {
  ADMIN: { color: 'text-red-600', bg: 'bg-red-50', label: 'Admin' },
  STUDENT: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Estud.' },
  PROFESSOR: { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Prof.' },
  STAFF: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Staff' },
  EXTERNAL: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Ext.' },
};

export const UserRow: React.FC<UserRowProps> = ({
  user,
  isAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const role = ROLE_CONFIG[user.user_type] || ROLE_CONFIG.EXTERNAL;

  return (
    <div className="group bg-white hover:bg-gray-50/50 border-b border-gray-100 last:border-0 transition-all duration-200">
      <div className="flex items-center px-6 py-4 gap-6">
        {/* User Info */}
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative shrink-0">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.username} 
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {user.first_name} {user.last_name}
            </span>
            <span className="text-xs text-gray-400 font-medium">@{user.username}</span>
          </div>
        </div>

        {/* Email & ID */}
        <div className="flex-1 hidden md:flex flex-col gap-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Mail className="w-3.5 h-3.5 text-gray-300" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Fingerprint className="w-3 h-3" />
            CI: {user.id_card}
          </div>
        </div>

        {/* Role */}
        <div className="w-24 shrink-0">
          <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${role.bg} ${role.color}`}>
            {role.label}
          </span>
        </div>

        {/* Joined Date */}
        <div className="w-32 hidden lg:flex shrink-0 flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unido</span>
          <span className="text-xs text-gray-600 font-medium">{new Date(user.date_joined).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 min-w-[124px]">
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(user)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-90"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleStatus?.(user.id, !user.is_active)}
                className={`p-2 rounded-lg transition-all active:scale-90 ${
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
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all active:scale-90"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
