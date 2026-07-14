import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);
const ALLOWED_ROLES = ['ADMIN'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      authAPI.me().then(res => {
        const userData = res.data?.data || res.data;
        if (userData && !ALLOWED_ROLES.includes(userData.role)) {
          localStorage.removeItem('admin_token');
          toast.error('Access denied. This portal is for Admins only.');
        } else {
          setUser(userData);
        }
      }).catch(() => {
        localStorage.removeItem('admin_token');
        toast.error('Session expired, please login again');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const data = res.data?.data || res.data;
    if (data?.accessToken) {
      if (data.user && !ALLOWED_ROLES.includes(data.user.role)) {
        throw new Error('Access denied. This portal is for Admins only.');
      }
      localStorage.setItem('admin_token', data.accessToken);
      setUser(data.user);
      return true;
    }
    throw new Error('Login failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
