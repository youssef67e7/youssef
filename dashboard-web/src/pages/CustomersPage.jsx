import { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';
import { Search, Eye, Ban, CheckCircle, Users, Loader2, X, Mail, Phone, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await customersAPI.list({ search: s || undefined, limit: 20, page: p });
      const raw = res.data;
      const d = raw?.data || raw;
      const list = d?.users || d?.customers || (Array.isArray(d) ? d : []);
      setCustomers(Array.isArray(list) ? list : []);
      setTotalPages(d?.totalPages || Math.ceil((d?.total || 0) / 20) || 1);
    } catch { toast.error('Failed to load customers'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => { setPage(1); load(1, searchInput); setSearch(searchInput); };

  const handleToggleBlock = (c) => {
    const isBlocked = c.isBlocked || c.blocked;
    setConfirmAction(() => async () => {
      try {
        if (isBlocked) {
          await customersAPI.unblock(c._id || c.id);
          toast.success('Customer unblocked');
        } else {
          await customersAPI.toggleBlock(c._id || c.id);
          toast.success('Customer blocked');
        }
        load();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    });
    setShowConfirm(true);
  };

  const viewDetails = async (c) => {
    setSelectedCustomer(c);
    setShowDetails(true);
    setLoadingOrders(true);
    try {
      const res = await customersAPI.orders(c._id || c.id, { limit: 50 });
      const raw = res.data;
      const d = raw?.data || raw;
      const list = d?.orders || (Array.isArray(d) ? d : []);
      setCustomerOrders(Array.isArray(list) ? list : []);
    } catch { toast.error('Failed to load orders'); }
    setLoadingOrders(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" subtitle="Manage your customer base" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="Search by name, email, or phone..." />
          </div>
          <button onClick={handleSearch} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">Search</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Name</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Email</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Phone</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Orders</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Total Spent</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Status</th>
                <th className="px-5 py-3 font-medium dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400"><Users size={32} className="mx-auto mb-2 opacity-50" />No customers found</td></tr>
              ) : customers.map(c => (
                <tr key={c._id || c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium dark:text-white">{c.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{c.email || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{c.phone || '—'}</td>
                  <td className="px-5 py-3 dark:text-gray-300">{c.orderCount ?? c.ordersCount ?? 0}</td>
                  <td className="px-5 py-3 dark:text-white font-medium">${c.totalSpent ?? c.totalOrders ?? 0}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.isBlocked || c.blocked ? 'error' : 'active'} label={c.isBlocked || c.blocked ? 'Blocked' : 'Active'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => viewDetails(c)} className="text-blue-500 hover:text-blue-700" title="View Details"><Eye size={16} /></button>
                      <button onClick={() => handleToggleBlock(c)}
                        className={c.isBlocked || c.blocked ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}
                        title={c.isBlocked || c.blocked ? 'Unblock' : 'Block'}>
                        {c.isBlocked || c.blocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }}
            className="px-3 py-1.5 border dark:border-gray-600 rounded text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); load(p); }}
              className={`px-3 py-1.5 border rounded text-sm ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }}
            className="px-3 py-1.5 border dark:border-gray-600 rounded text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
        </div>
      )}

      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Customer Details</h3>
              <button onClick={() => { setShowDetails(false); setSelectedCustomer(null); setCustomerOrders([]); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Users size={12} /> Name</p>
                <p className="font-medium dark:text-white">{selectedCustomer.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Mail size={12} /> Email</p>
                <p className="font-medium dark:text-white">{selectedCustomer.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Phone size={12} /> Phone</p>
                <p className="font-medium dark:text-white">{selectedCustomer.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><ShoppingCart size={12} /> Total Orders</p>
                <p className="font-medium dark:text-white">{selectedCustomer.orderCount ?? selectedCustomer.ordersCount ?? 0}</p>
              </div>
            </div>

            <h4 className="font-semibold dark:text-white mb-3">Order History</h4>
            {loadingOrders ? (
              <div className="text-center py-4"><Loader2 size={20} className="animate-spin mx-auto text-gray-400" /></div>
            ) : customerOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <tr>
                      <th className="pb-2 font-medium">Order #</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {customerOrders.map(o => (
                      <tr key={o._id || o.id}>
                        <td className="py-2 dark:text-white">{o.orderNumber || o._id?.slice(-8)}</td>
                        <td className="py-2 dark:text-gray-300">${o.totalAmount || o.total || 0}</td>
                        <td className="py-2"><StatusBadge status={o.status} /></td>
                        <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog open={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={() => { confirmAction?.(); setShowConfirm(false); }}
        title="Confirm Action" message="Are you sure you want to proceed?" />
    </div>
  );
}
