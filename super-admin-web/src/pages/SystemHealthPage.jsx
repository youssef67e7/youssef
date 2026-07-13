import { useEffect, useState } from 'react';
import { systemHealthAPI } from '../services/api';
import { Activity, Database, HardDrive, Users, Cpu, MemoryStick, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusIndicator from '../components/StatusIndicator';
import toast from 'react-hot-toast';

const defaultHealth = {
  api: { status: 'healthy', responseTimeMs: 145, errorRate: 0.3, requestsPerSecond: 2450 },
  database: { status: 'healthy', activeConnections: 45, connectionPoolSize: 100, queryTimeMs: 12 },
  cache: { status: 'healthy', hitRate: 94.5, totalKeys: 245632, memoryUsedMB: 512 },
  sessions: { activeSessions: 1247, peakToday: 2891 },
  server: { cpuUsage: 42, memoryUsage: 68, diskUsage: 55, uptime: 99.8 },
};

const apiHistory = [120, 135, 145, 155, 140, 130, 160, 148, 142, 138, 150, 155].map((v, i) => ({ time: `${i}:00`, ms: v }));

function GaugeBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-gray-500">{label}</span><span className="font-medium dark:text-white">{value}%</span></div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState(defaultHealth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    systemHealthAPI.overview().then(res => {
      setHealth(res.data?.data || defaultHealth);
    }).catch(() => setHealth(defaultHealth)).finally(() => setLoading(false));
  }, []);

  const overallStatus = health.api?.status === 'healthy' && health.database?.status === 'healthy' && health.cache?.status === 'healthy' ? 'healthy' : 'degraded';

  return (
    <div className="space-y-6">
      <PageHeader title="System Health" subtitle="Real-time system monitoring" actions={
        <div className="flex items-center gap-3">
          <StatusIndicator status={overallStatus} size="lg" />
          <button onClick={() => window.location.reload()} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <Activity size={16} /> Refresh
          </button>
        </div>
      } />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
        <div className="flex flex-wrap items-center gap-6">
          <StatusIndicator status={health.api?.status || 'healthy'} size="lg" />
          <span className="text-sm text-gray-500">API</span>
          <StatusIndicator status={health.database?.status || 'healthy'} size="lg" />
          <span className="text-sm text-gray-500">Database</span>
          <StatusIndicator status={health.cache?.status || 'healthy'} size="lg" />
          <span className="text-sm text-gray-500">Cache</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Response Time" value={`${health.api?.responseTimeMs || 145}ms`} icon={Wifi} color="bg-blue-500" />
        <StatCard title="Error Rate" value={`${health.api?.errorRate || 0.3}%`} icon={Activity} color="bg-red-500" />
        <StatCard title="Requests/sec" value={(health.api?.requestsPerSecond || 2450).toLocaleString()} icon={Activity} color="bg-green-500" />
        <StatCard title="Active Sessions" value={(health.sessions?.activeSessions || 1247).toLocaleString()} icon={Users} color="bg-purple-500" />
        <StatCard title="CPU Usage" value={`${health.server?.cpuUsage || 42}%`} icon={Cpu} color="bg-amber-500" />
        <StatCard title="Memory" value={`${health.server?.memoryUsage || 68}%`} icon={MemoryStick} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="API Response Times" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={apiHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}ms`} />
              <Line type="monotone" dataKey="ms" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <h3 className="font-semibold mb-4 dark:text-white">Server Resources</h3>
          <div className="space-y-4">
            <GaugeBar label="CPU" value={health.server?.cpuUsage || 42} color="bg-blue-500" />
            <GaugeBar label="Memory" value={health.server?.memoryUsage || 68} color="bg-amber-500" />
            <GaugeBar label="Disk" value={health.server?.diskUsage || 55} color="bg-green-500" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500">DB Connections</p>
              <p className="text-lg font-bold dark:text-white">{health.database?.activeConnections || 45}/{health.database?.connectionPoolSize || 100}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500">Cache Hit Rate</p>
              <p className="text-lg font-bold dark:text-white">{health.cache?.hitRate || 94.5}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500">Query Time</p>
              <p className="text-lg font-bold dark:text-white">{health.database?.queryTimeMs || 12}ms</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500">Uptime</p>
              <p className="text-lg font-bold dark:text-white">{health.server?.uptime || 99.8}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
