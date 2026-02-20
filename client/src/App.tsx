import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { MainLayout } from './layouts/MainLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminProcedures from './pages/AdminProcedures'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import News from './pages/News'
import Register from './pages/Register'
import {
    PostInterProcedure,
    PostNatProcedure,
    TitleLegalization,
    UnderInterProcedure,
    UnderNatProcedure
} from './pages/procedures/teaching-secretary'

function App() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
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
          <Route path="/procedures" element={<div className="p-8 text-center text-gray-400">Gestión de Trámites (Próximamente)</div>} />
          
          {/* Teaching Secretary Procedures */}
          <Route path="/procedures/secretary/undergraduate/national" element={<UnderNatProcedure />} />
          <Route path="/procedures/secretary/undergraduate/international" element={<UnderInterProcedure />} />
          <Route path="/procedures/secretary/postgraduate/national" element={<PostNatProcedure />} />
          <Route path="/procedures/secretary/postgraduate/international" element={<PostInterProcedure />} />
          <Route path="/procedures/secretary/title-legalization" element={<TitleLegalization />} />
          
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<div className="p-8 text-center text-gray-400">Mi Perfil (Próximamente)</div>} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              isAdmin ? (
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<div className="p-8 text-center text-gray-400">Gestión de Usuarios (Próximamente)</div>} />
                  <Route path="procedures" element={<AdminProcedures />} />
                  <Route path="settings" element={<div className="p-8 text-center text-gray-400">Configuración del Sistema (Próximamente)</div>} />
                </Routes>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
