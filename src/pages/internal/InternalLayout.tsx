import React from 'react';
import { Outlet } from 'react-router';

const InternalLayout: React.FC = () => {
  return (
    <div className="internal-layout flex w-full h-full">
      {/* Puedes añadir aquí Sidebar o Header comunes para las rutas internas */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default InternalLayout;
