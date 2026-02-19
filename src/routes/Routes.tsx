import { ProceduresManagement } from '@/pages/TeachingSecretary/ProceduresManagement';
import { UnderNatProcedure } from '@/pages/TeachingSecretary/procedures/UnderNatProcedure';
import { UnderInterProcedure } from '@/pages/TeachingSecretary/procedures/UnderInterProcedure';
import { PostNatProcedure } from '@/pages/TeachingSecretary/procedures/PostNatProcedure';
import { PostInterProcedure } from '@/pages/TeachingSecretary/procedures/PostInterProcedure';
import { TitleLegalization } from '@/pages/TeachingSecretary/procedures/TitleLegalization';
import routes from '@/routes/paths';
import { lazyAdminComponents, lazyPages } from '@/utils/lazy-imports';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

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
  UsersAdmin, StructureAdmin, RolesAdmin, DashboardAdmin, EmailConfig, NewsAdmin, ProceduresAdmin
} = lazyAdminComponents;

// Componente para rutas de administración protegidas
const AdminRoutes = () => (
  <ProtectedRoute requiredRole="ADMIN">
    <Admin />
  </ProtectedRoute>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Rutas públicas accesibles sin autenticación */}
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.support} element={<Contact />} />
        <Route path={routes.news} element={<News />} />
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.register} element={<Register />} />

        {/* Rutas de secretaría - accesibles sin autenticación */}
        <Route path={`${routes.procedures.secretary.root}/*`} element={<TeachingSecretary />}>
          <Route index element={null} />
          <Route path="undernat" element={<UnderNatProcedure />} />
          <Route path="underinter" element={<UnderInterProcedure />} />
          <Route path="postnat" element={<PostNatProcedure />} />
          <Route path="postinter" element={<PostInterProcedure />} />
          <Route path="legaliz" element={<TitleLegalization />} />
          <Route path=":id" element={null} />
        </Route>

        {/* Rutas protegidas que requieren autenticación */}
        <Route path={routes.profile} element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path={routes.procedures.root} element={
          <ProtectedRoute>
            <Procedures />
          </ProtectedRoute>
        } />

        {/* Rutas de administración - requieren rol ADMIN */}
        <Route path={routes.admin.root} element={<AdminRoutes />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="structure" element={<StructureAdmin />} />
          <Route path="roles" element={<RolesAdmin />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="email" element={<EmailConfig />} />
          <Route path="news" element={<NewsAdmin />} />
          <Route path="procedures" element={<ProceduresAdmin />} />

          {/* Rutas de administración interna */}
          <Route path="internal/procedures" element={<InternalAdmin />} />
          <Route path="internal/personal" element={<InternalAdmin />} />
          <Route path="internal/config" element={<InternalConfig />} />

          {/* Rutas de administración de secretaría */}
          <Route path="secretary/procedures" element={<ProceduresManagement />} />
          <Route path="secretary/personal" element={<UsersAdmin />} />
          <Route path="secretary/config" element={<InternalConfig />} />
        </Route>

        {/* Rutas protegidas para administración interna - requieren rol ADMIN o STAFF */}
        <Route path={routes.internalAdmin()} element={
          <ProtectedRoute requiredRole={['ADMIN', 'STAFF']}>
            <InternalAdmin />
          </ProtectedRoute>
        } />
        
        <Route path={routes.myProcedures} element={
          <ProtectedRoute>
            <MyProcedures />
          </ProtectedRoute>
        } />

        {/* Layout base para sección interna - requiere rol INTERNAL o superior */}
        <Route path={routes.procedures.internal.root} element={
          <ProtectedRoute requiredRole={['ADMIN', 'STAFF', 'INTERNAL']}>
            <InternalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<InternalConfig />} />
          <Route path="config" element={<InternalConfig />} />
          {/* Rutas de procedimientos internos como rutas anidadas dentro del layout */}
          <Route path="procedures/feeding" element={<Feeding />} />
          <Route path="procedures/transport" element={<Transport />} />
          <Route path="procedures/maintenance" element={<Maintenance />} />
          <Route path="procedures/accommodation" element={<Accommodation />} />
        </Route>

        {/* Ruta fallback para páginas no encontradas - DEBE SER LA ÚLTIMA */}
        {/* Ruta para usuarios no autorizados */}
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso no autorizado</h1>
              <p className="text-gray-700 mb-6">No tienes permiso para acceder a esta página.</p>
              <button 
                onClick={() => window.location.href = routes.home}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        } />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};
