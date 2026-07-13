import { useEffect, useState } from 'react';
import { categoriesAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await categoriesAPI.list(); setCategories(res.data?.data || res.data || []); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await categoriesAPI.create({ name }); toast.success('Added'); setName(''); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await categoriesAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Category name" className="px-4 py-2 border rounded-lg text-sm flex-1 max-w-sm" />
        <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {loading ? <div className="py-8 text-center text-gray-400">Loading...</div> :
          categories.length === 0 ? <div className="py-8 text-center text-gray-400">No categories</div> :
            categories.map(c => (
              <div key={c._id || c.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-medium">{c.name}</span>
                <button onClick={() => handleDelete(c._id || c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            ))}
      </div>
    </div>
  );
}
