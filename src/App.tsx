import { useAuth } from '@/context/auth';
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
//import 'primereact/resources/primereact.min.css';

import { AddFooter } from "./components/platform/addfooter/AddFooter";
import { NavBar } from "./components/platform/navbar/NavBar";
import { AppRoutes } from "./routes/Routes";

function App() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated and not on a public route
  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/', '/news', '/support', '/unauthorized'];
    const secretaryPublicRoutes = ['/secretary/', '/undernat', '/underinter', '/postnat', '/postinter', '/legaliz'];
    const isPublicRoute = publicRoutes.includes(location.pathname) || 
                         secretaryPublicRoutes.some(route => location.pathname.includes(route));
    
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      {/* Global error notification */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
          <p>{error}</p>
        </div>
      )}
      <main className={`min-h-[calc(100vh-64px)] ${error ? 'pt-12' : ''}`}>
        <AppRoutes />
      </main>
      <footer className="flex flex-col justify-center items-start w-screen text-sm font-bold mt-auto">
        <AddFooter />
        <div className="w-full flex flex-row justify-center items-center gap-3 py-2">
          <img
            className="aspect-square w-6"
            src="/img/logo/svg/IdUHo-06.svg"
            alt="Logo UHo"
          />
          <span>Universidad de Holguín.2025©</span>
        </div>
      </footer>
    </>
  );
}

export default App;
