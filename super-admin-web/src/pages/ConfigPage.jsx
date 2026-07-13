import { useEffect, useState } from 'react';
import { configAPI } from '../services/api';
import { Settings, Database, CreditCard, Truck, Mail, HardDrive, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const sections = [
  { key: 'environment', label: 'Environment', icon: Settings },
  { key: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'email', label: 'Email/SMS', icon: Mail },
  { key: 'storage', label: 'Storage', icon: HardDrive },
  { key: 'cache', label: 'Cache', icon: Zap },
];

const fallbackConfig = {
  environment: { API_URL: 'https://pharmaworld.vercel.app', NODE_ENV: 'production', DB_HOST: 'mongodb+srv://...', REDIS_HOST: 'redis://...' },
  payment: { RAZORPAY_KEY_ID: 'rzp_****', RAZORPAY_KEY_SECRET: '****', CURRENCY: 'SAR', COD_ENABLED: 'true' },
  delivery: { DELIVERY_FEE: '15', FREE_DELIVERY_THRESHOLD: '200', MAX_DELIVERY_RADIUS: '15', DELIVERY_TIME_SLOT: '60' },
  email: { SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '587', SMS_PROVIDER: 'twilio', EMAIL_FROM: 'noreply@pharmaworld.com' },
  storage: { CLOUDINARY_CLOUD_NAME: 'pharmaworld', S3_BUCKET: 'pharmaworld-assets', MAX_FILE_SIZE: '10' },
  cache: { REDIS_TTL: '3600', CACHE_DRIVER: 'redis', SESSION_TTL: '86400' },
};

export default function ConfigPage() {
  const [activeSection, setActiveSection] = useState('environment');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configAPI.getAll().then(res => {
      const data = res.data?.data;
      if (data && typeof data === 'object') setConfig(data);
      else setConfig(fallbackConfig);
    }).catch(() => setConfig(fallbackConfig)).finally(() => setLoading(false));
  }, []);

  const currentConfig = config[activeSection] || fallbackConfig[activeSection] || {};
  const [editValues, setEditValues] = useState({});

  useEffect(() => { setEditValues(currentConfig); }, [activeSection, config]);

  const handleSave = async () => {
    try { await configAPI.updateSection(activeSection, editValues); toast.success('Config updated'); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Configuration" subtitle="System settings management" />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-2">
            {sections.map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeSection === s.key ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4 dark:text-white">{sections.find(s => s.key === activeSection)?.label}</h3>
          <div className="space-y-3">
            {Object.entries(editValues).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{key.replace(/_/g, ' ')}</label>
                <input value={value || ''} onChange={e => setEditValues({...editValues, [key]: e.target.value})}
                  className="sm:col-span-2 px-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
