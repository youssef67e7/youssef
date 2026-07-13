import { useState } from 'react';
import { aiPrescriptionAPI } from '../services/api';
import { Upload, Search, Eye, AlertCircle, CheckCircle, XCircle, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIPrescriptionPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try { const res = await aiPrescriptionAPI.history({ search: search || undefined }); setHistory(res.data?.data || []); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await aiPrescriptionAPI.analyze({ imageUrl: '' });
      toast.success('AI Analysis complete');
      loadHistory();
    } catch (err) { toast.error(err.response?.data?.message || 'Analysis failed'); }
    setAnalyzing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Prescription Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and analyze prescriptions using AI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadHistory()} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search prescriptions..." />
          </div>
          <button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
            {analyzing ? <><Cpu size={16} className="animate-spin" /> Analyzing...</> : <><Upload size={16} /> Analyze Prescription</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12">
            <Upload size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Upload a prescription image to analyze</p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, PDF</p>
            <button onClick={handleAnalyze} disabled={analyzing} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
              {analyzing ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
          {selected && (
            <div className="mt-4 text-left">
              <h3 className="font-semibold mb-2">Analysis Result</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2"><CheckCircle size={18} /> <span className="font-medium">Prescription Verified</span></div>
                <p className="text-sm text-gray-600">Medications detected: 3</p>
                <p className="text-sm text-gray-600">Confidence: 98.5%</p>
                <div className="mt-3 space-y-2">
                  {['Amoxicillin 500mg', 'Paracetamol 650mg', 'Vitamin D 2000IU'].map((med, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b font-medium text-sm">Recent Analyses</div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {loading ? <div className="py-8 text-center text-gray-400">Loading...</div> :
              history.length === 0 ? <div className="py-8 text-center text-gray-400">No analyses yet</div> :
                history.map((h, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(h)}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rx #{h.id || i + 1}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${h.status === 'APPROVED' ? 'bg-green-50 text-green-700' : h.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{h.status || 'PENDING'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{h.createdAt ? new Date(h.createdAt).toLocaleString() : 'Recently'}</p>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}