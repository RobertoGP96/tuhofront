import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si se requiere un rol específico, verificar permisos
  if (requiredRole && user) {
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
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