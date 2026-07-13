import { useEffect, useState } from 'react';
import { telemedicineAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Video, Phone, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyDoctor = { name: '', specialty: '', email: '', phone: '', isActive: true };

export default function TelemedicinePage() {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, docRes] = await Promise.allSettled([
        telemedicineAPI.appointments({ search: search || undefined }),
        telemedicineAPI.doctors({ search: search || undefined }),
      ]);
      if (appRes.status === 'fulfilled') { const d = appRes.value.data; setAppointments(d?.data || []); }
      if (docRes.status === 'fulfilled') { const d = docRes.value.data; setDoctors(d?.data || []); }
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAddDoctor = () => { setEditingDoctorId(null); setDoctorForm(emptyDoctor); setShowDoctorForm(true); };
  const openEditDoctor = (d) => { setEditingDoctorId(d._id || d.id); setDoctorForm({ name: d.name || '', specialty: d.specialty || '', email: d.email || '', phone: d.phone || '', isActive: d.isActive !== false }); setShowDoctorForm(true); };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctorId) { await telemedicineAPI.updateDoctor(editingDoctorId, doctorForm); toast.success('Updated'); }
      else { await telemedicineAPI.createDoctor(doctorForm); toast.success('Added'); }
      setShowDoctorForm(false); setEditingDoctorId(null); setDoctorForm(emptyDoctor); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!confirm('Delete doctor?')) return;
    try { await telemedicineAPI.deleteDoctor(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAppointmentStatus = async (id, status) => {
    try { await telemedicineAPI.updateAppointment(id, { status }); toast.success('Updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statusColors = { scheduled: 'bg-blue-50 text-blue-700', in_progress: 'bg-yellow-50 text-yellow-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-700' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Telemedicine</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" placeholder="Search..." />
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('appointments')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'appointments' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Appointments</button>
        <button onClick={() => setTab('doctors')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'doctors' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Doctors</button>
      </div>

      {tab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr><th className="px-5 py-3 font-medium">Patient</th><th className="px-5 py-3 font-medium">Doctor</th><th className="px-5 py-3 font-medium">Date & Time</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
                appointments.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No appointments</td></tr> :
                  appointments.map(a => (
                    <tr key={a._id || a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{a.patient?.name || a.patientName || '—'}</td>
                      <td className="px-5 py-3">{a.doctor?.name || a.doctorName || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{a.dateTime ? new Date(a.dateTime).toLocaleString() : '—'}</td>
                      <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs">{a.type === 'VIDEO' ? <Video size={14} /> : <Phone size={14} />} {a.type || '—'}</span></td>
                      <td className="px-5 py-3"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[a.status] || 'bg-gray-50 text-gray-700'}`}>{a.status || 'scheduled'}</span></td>
                      <td className="px-5 py-3">
                        <select value={a.status || 'scheduled'} onChange={e => handleAppointmentStatus(a._id || a.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                          <option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddDoctor} className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"><Plus size={16} /> Add Doctor</button>
          </div>

          {showDoctorForm && (
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between mb-3"><h2 className="font-semibold">{editingDoctorId ? 'Edit Doctor' : 'Add Doctor'}</h2><button onClick={() => { setShowDoctorForm(false); setEditingDoctorId(null); }}><X size={18} /></button></div>
              <form onSubmit={handleDoctorSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} required placeholder="Name *" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} required placeholder="Specialty *" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} placeholder="Email" type="email" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={doctorForm.isActive} onChange={e => setDoctorForm({...doctorForm, isActive: e.target.checked})} className="rounded" /> Active</label>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">{editingDoctorId ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={() => { setShowDoctorForm(false); setEditingDoctorId(null); }} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? Array.from({length: 3}).map((_, i) => <div key={i} className="bg-white rounded-xl shadow-sm border p-5 animate-pulse"><div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-3" /><div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" /></div>) :
              doctors.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400">No doctors</div> :
                doctors.map(d => (
                  <div key={d._id || d.id} className="bg-white rounded-xl shadow-sm border p-5 text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3"><Stethoscope size={28} className="text-primary-600" /></div>
                    <h3 className="font-semibold">{d.name}</h3>
                    <p className="text-sm text-primary-600">{d.specialty}</p>
                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      {d.email && <p>{d.email}</p>}
                      {d.phone && <p>{d.phone}</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${d.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{d.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button onClick={() => openEditDoctor(d)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteDoctor(d._id || d.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}