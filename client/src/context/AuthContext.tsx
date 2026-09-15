import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { User } from '../types';
import * as authService from '../services/authService';
import { getErrorMessage } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('ej_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const currentUser = await authService.fetchCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('ej_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authService.loginUser({ email, password });
    localStorage.setItem('ej_token', token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: registeredUser } = await authService.registerUser({ name, email, password });
    localStorage.setItem('ej_token', token);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ej_token');
    setUser(null);
    toast.success('You have been signed out');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.fetchCurrentUser();
      setUser(currentUser);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const updateUser = useCallback((updated: User) => setUser(updated), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, updateUser }),
    [user, loading, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
