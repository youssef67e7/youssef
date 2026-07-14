import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const ALLOWED_ROLES = ['SUPER_ADMIN'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('super_admin_token');
    if (token) {
      authAPI.profile().then(res => {
        const userData = res.data?.data || res.data;
        if (userData && !ALLOWED_ROLES.includes(userData.role)) {
          localStorage.removeItem('super_admin_token');
          toast.error('Access denied. This portal is for Super Admins only.');
        } else {
          setUser(userData);
        }
      }).catch(() => {
        localStorage.removeItem('super_admin_token');
        toast.error('Session expired. Please login again.');
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
        throw new Error('Access denied. This portal is for Super Admins only.');
      }
      localStorage.setItem('super_admin_token', data.accessToken);
      setUser(data.user);
      return { requiresMfa: false };
    }
    if (data?.requiresMfa) {
      const token = data.mfaToken || data.sessionToken;
      return { requiresMfa: true, mfaToken: token, sessionToken: token };
    }
    throw new Error('Login failed');
  };

  const verifyMfa = async (code, mfaToken) => {
    const res = await authAPI.verifyMfa(code, mfaToken);
    const data = res.data?.data || res.data;
    if (data?.accessToken) {
      if (data.user && !ALLOWED_ROLES.includes(data.user.role)) {
        throw new Error('Access denied. This portal is for Super Admins only.');
      }
      localStorage.setItem('super_admin_token', data.accessToken);
      setUser(data.user);
      return true;
    }
    throw new Error('MFA verification failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('super_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyMfa, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
