
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { AuthState } from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<import('../types/auth.types').User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: authService.getStoredUser(),
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setState({ user, isAuthenticated: true, isLoading: false });
          authService.setStoredUser(user);
        } catch (error) {
          console.error("Auth initialization failed", error);
          authService.logout();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.login(username, password);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      authService.setStoredUser(response.user);
      return response.user;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
