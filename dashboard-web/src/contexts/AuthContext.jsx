import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('dashboard_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('dashboard_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI.me()
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data) {
          setUser(data.user || data);
        } else {
          clearAuth();
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setLoading(false));
  }, [clearAuth]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const data = res.data?.data || res.data;
    if (data?.accessToken) {
      localStorage.setItem('dashboard_token', data.accessToken);
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      const data = res.data?.data || res.data;
      if (data) {
        setUser(data.user || data);
        return data.user || data;
      }
    } catch {
      clearAuth();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
