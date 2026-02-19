// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/auth';
import type { UserProfile, LoginCredentials } from '@/types/user';
import { handleAuthError, AUTH_ERROR_CODES } from '@/utils/auth-errors';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem('tuhofront_auth') || '{}');
        if (authData.token) {
          // Validate token and get user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Clear invalid auth data
        localStorage.removeItem('tuhofront_auth');
        const authError = handleAuthError(error);
        setError(authError.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const credentials: LoginCredentials = { username, password };
      const authResponse = await authService.login(credentials);
      
      // Store auth data
      const authData = {
        token: authResponse.access,
        refresh: authResponse.refresh,
        user: authResponse.user
      };
      localStorage.setItem('tuhofront_auth', JSON.stringify(authData));
      
      setUser(authResponse.user);
    } catch (error: any) {
      const authError = handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('tuhofront_auth') || '{}');
      await authService.logout(authData.refresh);
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const refreshToken = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('tuhofront_auth') || '{}');
      if (authData.refresh) {
        const refreshResponse = await authService.refreshToken(authData.refresh);
        const updatedAuthData = {
          ...authData,
          token: refreshResponse.access,
          ...(refreshResponse.refresh && { refresh: refreshResponse.refresh })
        };
        localStorage.setItem('tuhofront_auth', JSON.stringify(updatedAuthData));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      refreshToken,
      error,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}