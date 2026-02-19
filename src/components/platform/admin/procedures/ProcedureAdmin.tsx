import { ArrowLeft, ClipboardList, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { ProcedureForm } from './ProcedureForm';
import { ProcedureList } from './ProcedureList';
import { ProcedureTypeList } from './ProcedureTypeList';

type ProcedureTab = 'requests' | 'catalog';
type ViewMode = 'list' | 'edit';

export const ProcedureAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProcedureTab>('requests');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedItem(null);
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedItem(null);
  };

  const handleViewDetails = (item: any) => {
      // In a real app, this might navigate to a detail page
      console.log('Viewing details for:', item);
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
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                {viewMode === 'list' 
                  ? 'Gestión de Trámites' 
                  : `Gestionar Trámite #${selectedItem?.follow_number}`
                }
              </h1>
              <p className="text-gray-500 font-medium">
                {viewMode === 'list' 
                  ? 'Supervisa las solicitudes y configura el catálogo institucional.'
                  : 'Cambia el estado o añade observaciones a la solicitud.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-8 bg-gray-50 p-1.5 rounded-2xl w-fit border border-gray-100">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activeTab === 'requests' ? 'animate-bounce' : ''}`} />
              Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'catalog' ? 'animate-bounce' : ''}`} />
              Catálogo
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        {viewMode === 'list' ? (
          <>
            {activeTab === 'requests' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <ProcedureList isAdmin={true} onEdit={handleEdit} onView={handleViewDetails} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <ProcedureTypeList isAdmin={true} onView={handleViewDetails} />
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            <ProcedureForm 
              initialData={selectedItem} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
