import type { UserProfile } from '@/types/user';
import { ArrowLeft, Users } from 'lucide-react';
import React, { useState } from 'react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';

type ViewMode = 'list' | 'create' | 'edit';

export const UsersAdmin: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {viewMode !== 'list' && (
              <button 
                onClick={handleCancel}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl hidden sm:block">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                  {viewMode === 'list' 
                    ? 'Gestión de Usuarios' 
                    : viewMode === 'create' 
                      ? 'Registrar Usuario' 
                      : `Editar: ${selectedUser?.first_name}`}
                </h1>
                <p className="text-gray-500 font-medium">
                  {viewMode === 'list' 
                    ? 'Controla los accesos, roles y perfiles de la comunidad.' 
                    : 'Completa los datos necesarios para actualizar la base de datos.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        {viewMode === 'list' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserList isAdmin={true} onEdit={handleEdit} onAdd={handleAdd} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto py-4">
            <UserForm 
              initialData={selectedUser || undefined} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
