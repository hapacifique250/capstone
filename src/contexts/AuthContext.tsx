import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'applicant' | 'admin' | 'super_admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { email: string; password: string; full_name: string; phone?: string; national_id?: string }) => Promise<{ error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  register: async () => ({}),
  logout: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rp_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('rp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-handler', {
        body: { action: 'login', email, password }
      });
      if (error) return { error: 'Login failed. Please try again.' };
      if (data?.error) return { error: data.error };
      
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('rp_user', JSON.stringify(userData));
      localStorage.setItem('rp_token', data.token);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (regData: { email: string; password: string; full_name: string; phone?: string; national_id?: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-handler', {
        body: { action: 'register', ...regData }
      });
      if (error) return { error: 'Registration failed. Please try again.' };
      if (data?.error) return { error: data.error };
      
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('rp_user', JSON.stringify(userData));
      localStorage.setItem('rp_token', data.token);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rp_user');
    localStorage.removeItem('rp_token');
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
