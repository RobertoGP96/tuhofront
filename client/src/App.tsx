import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import Home from './pages/Home'
import News from './pages/News'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [role, setRole] = useState<'user' | 'admin'>('user');

  return (
    <Router>
      <MainLayout role={role}>
        <div className="mb-8 flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setRole('user')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${role === 'user' ? 'bg-white text-primary-navy shadow-sm' : 'text-gray-500 hover:text-primary-navy'}`}
          >
            Modo Usuario
          </button>
          <button 
            onClick={() => setRole('admin')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${role === 'admin' ? 'bg-white text-primary-navy shadow-sm' : 'text-gray-500 hover:text-primary-navy'}`}
          >
            Modo Admin
          </button>
        </div>

        <Routes>
          {/* Public/User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/procedures" element={<div className="p-8 text-center text-gray-400">Gestión de Trámites (Próximamente)</div>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<div className="p-8 text-center text-gray-400">Mi Perfil (Próximamente)</div>} />

          {/* Admin Routes */}
          {role === 'admin' ? (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<div className="p-8 text-center text-gray-400">Gestión de Usuarios (Próximamente)</div>} />
              <Route path="/admin/procedures" element={<div className="p-8 text-center text-gray-400">Control de Trámites (Próximamente)</div>} />
              <Route path="/admin/settings" element={<div className="p-8 text-center text-gray-400">Configuración del Sistema (Próximamente)</div>} />
            </>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
