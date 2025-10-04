import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type User = {
  id?: number;
  name?: string;
  email?: string;
  // campos adicionales del usuario
} & Record<string, unknown>;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'tuhofront_auth';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Cargar desde localStorage si existe
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setToken(parsed.token ?? null);
        if (parsed.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // no-op
    }
  }, []);

  const persist = useCallback((nextUser: User | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${nextToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
    } catch {
      // no-op
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Endpoint por defecto; si tu backend es distinto, reemplaza la ruta.
    const loginUrl = 'http://localhost:8000/auth/login/';
    const response = await axios.post(loginUrl, { email, password });
    // Se asume que respuesta tiene { token, user }
    const { token: receivedToken, user: receivedUser } = response.data;
    persist(receivedUser ?? null, receivedToken ?? null);
  }, [persist]);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(token), login, logout }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
