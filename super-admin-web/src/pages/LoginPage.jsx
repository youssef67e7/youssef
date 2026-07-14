import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requiresMfa) {
        setShowMfa(true);
        setSessionToken(result.sessionToken);
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyMfa(mfaCode, sessionToken);
      toast.success('Verified!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-primary-700 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Super Admin</h1>
          <p className="text-gray-500 mt-1">Platform management access</p>
        </div>

        {!showMfa ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="admin@pharmaworld.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 transition">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfa} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Enter the 6-digit code from your authenticator app</p>
            <input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value)} required maxLength={6}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="------" />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 transition">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button type="button" onClick={() => { setShowMfa(false); setSessionToken(null); }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Back to login</button>
          </form>
        )}

        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 uppercase">Demo Credentials</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Email:</span> admin@pharmaworld.com</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Password:</span> Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
