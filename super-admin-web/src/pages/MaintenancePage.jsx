import { useEffect, useState } from 'react';
import { maintenanceAPI } from '../services/api';
import { Wrench, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const defaultMaintenance = { enabled: false, message: 'System is under maintenance. Please try again later.', scheduledStart: null, scheduledEnd: null, whitelistIPs: [] };

export default function MaintenancePage() {
  const [status, setStatus] = useState(defaultMaintenance);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(defaultMaintenance.message);
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [newIP, setNewIP] = useState('');

  useEffect(() => {
    maintenanceAPI.status().then(res => {
      const data = res.data?.data || defaultMaintenance;
      setStatus(data);
      setMessage(data.message || defaultMaintenance.message);
    }).catch(() => setStatus(defaultMaintenance)).finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    try {
      await maintenanceAPI.toggle();
      setStatus(s => ({ ...s, enabled: !s.enabled }));
      toast.success(status.enabled ? 'Maintenance mode disabled' : 'Maintenance mode enabled');
    } catch { toast.error('Failed'); }
  };

  const handleSchedule = async () => {
    if (!schedule.start || !schedule.end) { toast.error('Select dates'); return; }
    try {
      await maintenanceAPI.schedule({ start: schedule.start, end: schedule.end });
      toast.success('Maintenance scheduled');
      setSchedule({ start: '', end: '' });
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" subtitle="System maintenance management" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.enabled ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              <Wrench size={24} className={status.enabled ? 'text-red-600' : 'text-green-600'} />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">{status.enabled ? 'Currently active' : 'System is live'}</p>
            </div>
          </div>
          <button onClick={handleToggle}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${status.enabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            {status.enabled ? 'End Maintenance' : 'Start Maintenance'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4 dark:text-white flex items-center gap-2"><AlertTriangle size={18} /> Maintenance Message</h3>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Message shown to users..." />
          <button className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Save Message</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4 dark:text-white flex items-center gap-2"><Clock size={18} /> Schedule Maintenance</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Start</label>
              <input type="datetime-local" value={schedule.start} onChange={e => setSchedule({...schedule, start: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">End</label>
              <input type="datetime-local" value={schedule.end} onChange={e => setSchedule({...schedule, end: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button onClick={handleSchedule} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Schedule</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <h3 className="font-semibold mb-4 dark:text-white">Whitelist IPs</h3>
        <div className="flex gap-2 mb-3">
          <input value={newIP} onChange={e => setNewIP(e.target.value)} placeholder="IP address"
            className="flex-1 px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
          <button onClick={() => { if (newIP) { setStatus(s => ({...s, whitelistIPs: [...(s.whitelistIPs || []), newIP]})); setNewIP(''); } }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(status.whitelistIPs || []).map((ip, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
              {ip}
              <button onClick={() => setStatus(s => ({...s, whitelistIPs: s.whitelistIPs.filter((_, j) => j !== i)}))} className="text-gray-400 hover:text-red-500">&times;</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
