import { useEffect, useState } from 'react';
import { healthAPI, usersAPI, medicinesAPI, ordersAPI, categoriesAPI, brandsAPI, couponsAPI, deliveryAPI } from '../services/api';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const services = [
  { name: 'API Health', check: () => healthAPI.check(), key: 'health' },
  { name: 'Users Service', check: () => usersAPI.list({ limit: 1 }), key: 'users' },
  { name: 'Medicines Service', check: () => medicinesAPI.list({ limit: 1 }), key: 'medicines' },
  { name: 'Orders Service', check: () => ordersAPI.list({ limit: 1 }), key: 'orders' },
  { name: 'Categories Service', check: () => categoriesAPI.list(), key: 'categories' },
  { name: 'Brands Service', check: () => brandsAPI.list(), key: 'brands' },
  { name: 'Coupons Service', check: () => couponsAPI.list(), key: 'coupons' },
  { name: 'Delivery Service', check: () => deliveryAPI.list({ limit: 1 }), key: 'delivery' },
  { name: 'Auth Service', check: () => healthAPI.check(), key: 'auth' },
];

export default function ServicesPage() {
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    const newResults = {};
    await Promise.allSettled(
      services.map(async (s) => {
        const start = Date.now();
        try {
          await s.check();
          newResults[s.key] = { status: 'ok', latency: Date.now() - start };
        } catch (e) {
          newResults[s.key] = { status: 'error', message: e.response?.data?.message || e.message, latency: Date.now() - start };
        }
      })
    );
    setResults(newResults);
    setChecking(false);
    toast.success('Service check complete');
  };

  useEffect(() => { checkAll(); }, []);

  const okCount = Object.values(results).filter(r => r.status === 'ok').length;
  const errCount = Object.values(results).filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services Health</h1>
          <p className="text-gray-500 text-sm mt-1">Check connectivity between all backend services</p>
        </div>
        <button onClick={checkAll} disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          Check All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{okCount}</p>
          <p className="text-sm text-gray-500">Healthy</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{errCount}</p>
          <p className="text-sm text-gray-500">Failed</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{services.length}</p>
          <p className="text-sm text-gray-500">Total Services</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {services.map(s => {
          const r = results[s.key];
          return (
            <div key={s.key} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {!r ? <Loader2 size={20} className="animate-spin text-gray-400" /> :
                  r.status === 'ok' ? <CheckCircle size={20} className="text-green-500" /> :
                    <XCircle size={20} className="text-red-500" />}
                <div>
                  <p className="font-medium">{s.name}</p>
                  {r?.message && <p className="text-xs text-red-500">{r.message}</p>}
                </div>
              </div>
              <div className="text-right">
                {r && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {r.status === 'ok' ? `${r.latency}ms` : 'Error'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
