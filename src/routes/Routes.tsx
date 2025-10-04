import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import routes from '@/routes/paths';
import { lazyPages, lazyAdminComponents } from '@/utils/lazy-imports';

// Componente de loading mejorado
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Destructuring de componentes lazy
const {
  Home, Contact, News, Login, Register, TeachingSecretary, Profile, Procedures,
  Admin, InternalAdmin, InternalConfig, MyProcedures, InternalLayout,
  Feeding, Transport, Accommodation, Maintenance, NotFound
} = lazyPages;

const {
  UsersAdmin, StructureAdmin, RolesAdmin, DashboardAdmin, EmailConfig
} = lazyAdminComponents;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      <Route path={routes.home} element={<Home />} />
      <Route path={routes.support} element={<Contact />} />
      <Route path={routes.news} element={<News />} />
      
      {/* Rutas de secretaría */}
      <Route path={routes.procedures.secretary.detail()} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.undernat} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.underinter} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.postnat} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.postinter} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.legaliz} element={<TeachingSecretary />} />

      <Route path={routes.profile} element={<Profile />} />
      <Route path={routes.procedures.root} element={<Procedures />} />

      <Route path={routes.login} element={<Login />} />
      <Route path={routes.register} element={<Register />} />

      <Route path={routes.admin.root} element={<Admin />}>
        <Route index element={<DashboardAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="structure" element={<StructureAdmin />} />
        <Route path="roles" element={<RolesAdmin />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="email" element={<EmailConfig />} />

        {/* Rutas de administración interna */}
        <Route path="internal/procedures" element={<InternalAdmin />} />
        <Route path="internal/personal" element={<InternalAdmin />} />
        <Route path="internal/config" element={<InternalConfig />} />

        {/* Rutas de administración de secretaría */}
        <Route path="secretary/procedures" element={<TeachingSecretary />} />
        <Route path="secretary/personal" element={<UsersAdmin />} />
        <Route path="secretary/config" element={<InternalConfig />} />
      </Route>

      <Route path={routes.internalAdmin()} element={<InternalAdmin />} />
      <Route path={routes.myProcedures} element={<MyProcedures />} />

      {/* Layout base para sección interna */}
      <Route path={routes.procedures.internal.root} element={<InternalLayout />}>
        <Route index element={<InternalConfig />} />
        <Route path="config" element={<InternalConfig />} />
        {/* Rutas de procedimientos internos como rutas anidadas dentro del layout */}
        <Route path="procedures/feeding" element={<Feeding />} />
        <Route path="procedures/transport" element={<Transport />} />
        <Route path="procedures/maintenance" element={<Maintenance />} />
        <Route path="procedures/accommodation" element={<Accommodation />} />
      </Route>

      {/* Ruta fallback para páginas no encontradas - DEBE SER LA ÚLTIMA */}
      <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};
