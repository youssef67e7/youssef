import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const ALLOWED_ROLES = ['PHARMACIST'];

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
        const userData = data?.user || data;
        if (userData && !ALLOWED_ROLES.includes(userData.role)) {
          clearAuth();
          toast.error('Access denied. This portal is for Pharmacists only.');
        } else if (userData) {
          setUser(userData);
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
      if (data.user && !ALLOWED_ROLES.includes(data.user.role)) {
        throw new Error('Access denied. This portal is for Pharmacists only.');
      }
      localStorage.setItem('dashboard_token', data.accessToken);
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    clearAuth();
    window.location.href = '/dashboard/login';
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      const data = res.data?.data || res.data;
      const userData = data?.user || data;
      if (userData) {
        setUser(userData);
        return userData;
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
