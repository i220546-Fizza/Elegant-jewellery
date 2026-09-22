import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthResponse, User } from '../types';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, phone: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'layers_token';
const USER_KEY = 'layers_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // corrupted storage, ignore
    } finally {
      setLoading(false);
    }
  }, []);

  function persist(auth: AuthResponse) {
    const { token: t, ...userData } = auth;
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(t);
    setUser(userData);
  }

  async function login(email: string, password: string) {
    const auth = await authService.login({ email, password });
    persist(auth);
    return auth;
  }

  async function register(name: string, email: string, phone: string, password: string) {
    const auth = await authService.register({ name, email, phone, password });
    persist(auth);
    return auth;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
