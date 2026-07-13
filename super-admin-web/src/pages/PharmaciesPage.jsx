import { useEffect, useState } from 'react';
import { pharmaciesAPI } from '../services/api';
import { Building2, Eye, Pause, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import StatusIndicator from '../components/StatusIndicator';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const fallbackPharmacies = [
  { id: '1', name: 'PharmaWorld Central', city: 'New York', region: 'North', managerName: 'John Smith', status: 'active', totalRevenue: 345000, totalOrders: 12500, rating: 4.8 },
  { id: '2', name: 'PharmaWorld North', city: 'Chicago', region: 'North', managerName: 'Sarah Johnson', status: 'active', totalRevenue: 298000, totalOrders: 10800, rating: 4.6 },
  { id: '3', name: 'PharmaWorld South', city: 'Miami', region: 'South', managerName: 'Mike Davis', status: 'active', totalRevenue: 267000, totalOrders: 9600, rating: 4.5 },
  { id: '4', name: 'PharmaWorld East', city: 'Boston', region: 'East', managerName: 'Emily Brown', status: 'active', totalRevenue: 234000, totalOrders: 8400, rating: 4.4 },
  { id: '5', name: 'PharmaWorld West', city: 'Los Angeles', region: 'West', managerName: 'David Wilson', status: 'inactive', totalRevenue: 198000, totalOrders: 7100, rating: 4.3 },
  { id: '6', name: 'PharmaWorld Central 2', city: 'Houston', region: 'Central', managerName: 'Lisa Anderson', status: 'active', totalRevenue: 176000, totalOrders: 6300, rating: 4.2 },
];

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    pharmaciesAPI.list({}).then(res => {
      const data = res.data?.data;
      setPharmacies(Array.isArray(data) ? data : data?.pharmacies || fallbackPharmacies);
    }).catch(() => setPharmacies(fallbackPharmacies)).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try { await pharmaciesAPI.toggle(id); toast.success('Pharmacy toggled'); load(); }
    catch { toast.error('Failed'); }
  };

  const chartData = pharmacies.slice(0, 6).map(p => ({ name: p.name?.replace('PharmaWorld ', '') || p.name, revenue: p.totalRevenue }));

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacies" subtitle={`${pharmacies.length} branches total`} />

      <ChartCard title="Branch Performance" height={250}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Branch</th>
              <th className="px-5 py-3 font-medium">City</th>
              <th className="px-5 py-3 font-medium">Manager</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Revenue</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr> :
              pharmacies.map(p => (
                <tr key={p.id || p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{p.city}, {p.region}</td>
                  <td className="px-5 py-3 text-gray-500">{p.managerName}</td>
                  <td className="px-5 py-3"><StatusIndicator status={p.status} /></td>
                  <td className="px-5 py-3 font-medium">${p.totalRevenue?.toLocaleString()}</td>
                  <td className="px-5 py-3">{p.totalOrders?.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className="flex items-center gap-1"><span className="text-amber-500">★</span>{p.rating}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(p)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Eye size={16} /></button>
                      <button onClick={() => handleToggle(p.id || p._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        {p.status === 'active' ? <Pause size={16} className="text-orange-500" /> : <Play size={16} className="text-green-500" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{detail.name}</h3>
            <div className="space-y-2 text-sm">
              {[['City', `${detail.city}, ${detail.region}`], ['Manager', detail.managerName], ['Status', detail.status],
                ['Revenue', `$${detail.totalRevenue?.toLocaleString()}`], ['Orders', detail.totalOrders?.toLocaleString()],
                ['Rating', `${detail.rating}/5.0`]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b dark:border-gray-700">
                  <span className="text-gray-500">{k}</span><span className="font-medium dark:text-white">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetail(null)} className="mt-4 w-full py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
