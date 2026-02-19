import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si se requiere un rol específico, verificar permisos
  if (requiredRole && user) {
    const userRole = user.user_type; // Use user_type from UserProfile
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    const hasRequiredRole = requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Componente para rutas públicas que redirigen si ya está autenticado
export const PublicRoute = ({ 
  children, 
  redirectTo = '/profile' 
}: { 
  children: ReactNode; 
  redirectTo?: string;
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};