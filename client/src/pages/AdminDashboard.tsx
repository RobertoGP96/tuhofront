import React from 'react';

const AdminDashboard: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-primary-navy">Panel de Control</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Trámites Hoy', value: '24' },
        { label: 'Pendientes', value: '12' },
        { label: 'Completados', value: '85' },
        { label: 'Usuarios Activos', value: '312' },
      ].map((stat) => (
        <div key={stat.label} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <p className="text-xs text-gray-400 uppercase font-bold">{stat.label}</p>
          <p className="text-2xl font-black text-primary-navy">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;
