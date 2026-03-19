import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { RoleGuard } from './components/RoleGuard'
import { useAuth } from './hooks/useAuth'
import { MainLayout } from './layouts/MainLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminAreas from './pages/AdminAreas'
import AdminNews from './pages/AdminNews'
import AdminLocals from './pages/AdminLocals'
import AdminSettings from './pages/AdminSettings'
import Profile from './pages/Profile'
import AdminProcedures from './pages/AdminProcedures'
import AdminInternalProcedures from './pages/AdminInternalProcedures'
import MyProcedures from './pages/MyProcedures'
import ProcedureDetail from './pages/ProcedureDetail'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import News from './pages/News'
import Register from './pages/Register'
import { AccommodationProcedurePage } from './pages/procedures/internal/AccommodationProcedurePage'
import { FeedingProcedurePage } from './pages/procedures/internal/FeedingProcedurePage'
import { MaintenanceProcedurePage } from './pages/procedures/internal/MaintenanceProcedurePage'
import { TransportProcedurePage } from './pages/procedures/internal/TransportProcedurePage'
import {
  PostInterProcedure,
  PostNatProcedure,
  TitleLegalization,
  UnderInterProcedure,
  UnderNatProcedure
} from './pages/procedures/teaching-secretary'
import SecretaryDashboard from './pages/SecretaryDashboard'
import SecretaryProcedures from './pages/SecretaryProcedures'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'
import LocalsCatalog from './pages/locals/LocalsCatalog'
import LocalDetail from './pages/locals/LocalDetail'
import ReservationForm from './pages/locals/ReservationForm'
import MyReservations from './pages/locals/MyReservations'

function App() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-navy">
        <div className="h-12 w-12 animate-spin rounded-full border-4 text-secondary-lime border-secondary-lime border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout role={isAdmin ? 'admin' : 'user'}>
        <Routes>
          {/* Public/User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/news" element={<News />} />
          {/* Procedure Detail — must come before /procedures to ensure explicit match */}
          <Route
            path="/procedures/:id"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <ProcedureDetail />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <MyProcedures />
              </RoleGuard>
            }
          />

          {/* Teaching Secretary Procedures — accessible by all authenticated users */}
          <Route
            path="/procedures/secretary/undergraduate/national"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <UnderNatProcedure />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/secretary/undergraduate/international"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <UnderInterProcedure />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/secretary/postgraduate/national"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <PostNatProcedure />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/secretary/postgraduate/international"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <PostInterProcedure />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/secretary/title-legalization"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <TitleLegalization />
              </RoleGuard>
            }
          />

          {/* Internal Procedures — PROFESOR, TRABAJADOR, ADMIN only */}
          <Route
            path="/procedures/internal/feeding"
            element={
              <RoleGuard roles={['PROFESOR', 'TRABAJADOR', 'ADMIN']}>
                <FeedingProcedurePage />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/internal/accommodation"
            element={
              <RoleGuard roles={['PROFESOR', 'TRABAJADOR', 'ADMIN']}>
                <AccommodationProcedurePage />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/internal/transport"
            element={
              <RoleGuard roles={['PROFESOR', 'TRABAJADOR', 'ADMIN']}>
                <TransportProcedurePage />
              </RoleGuard>
            }
          />
          <Route
            path="/procedures/internal/maintenance"
            element={
              <RoleGuard roles={['PROFESOR', 'TRABAJADOR', 'ADMIN']}>
                <MaintenanceProcedurePage />
              </RoleGuard>
            }
          />

          {/* Locals — public catalog; reserve & my-reservations before :id to match first */}
          <Route path="/locals" element={<LocalsCatalog />} />
          <Route
            path="/locals/reserve"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <ReservationForm />
              </RoleGuard>
            }
          />
          <Route
            path="/locals/my-reservations"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <MyReservations />
              </RoleGuard>
            }
          />
          <Route path="/locals/:id" element={<LocalDetail />} />

          <Route path="/contact" element={<Contact />} />
          <Route
            path="/profile"
            element={
              <RoleGuard roles={['ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE', 'ADMIN']}>
                <Profile />
              </RoleGuard>
            }
          />

          {/* Secretary Management Panel — SECRETARIA_DOCENTE and ADMIN only */}
          <Route
            path="/secretary/*"
            element={
              <RoleGuard roles={['SECRETARIA_DOCENTE', 'ADMIN']}>
                <Routes>
                  <Route index element={<SecretaryDashboard />} />
                  <Route path="procedures" element={<SecretaryProcedures />} />
                </Routes>
              </RoleGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <RoleGuard roles={['ADMIN']}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="procedures" element={<AdminProcedures />} />
                  <Route path="internal" element={<AdminInternalProcedures />} />
                  <Route path="areas" element={<AdminAreas />} />
                  <Route path="news" element={<AdminNews />} />
                  <Route path="locals" element={<AdminLocals />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </RoleGuard>
            }
          />

          {/* Error pages */}
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
