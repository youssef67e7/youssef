import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, CreditCard, Truck, Flag, Wrench, Save, X } from 'lucide-react';
import { settingsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingOverlay from '../components/LoadingOverlay';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'features', label: 'Feature Flags', icon: Flag },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState({ storeName: '', contactEmail: '', contactPhone: '', address: '', logo: '' });
  const [payment, setPayment] = useState({ acceptedMethods: [], stripeKey: '', paypalClientId: '', codEnabled: true });
  const [delivery, setDelivery] = useState({ zones: [], baseFee: '', freeDeliveryThreshold: '' });
  const [features, setFeatures] = useState({});
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });

  const loadTab = async () => {
    setLoading(true);
    try {
      if (activeTab === 'general') {
        const res = await settingsAPI.general();
        const data = res.data?.data || res.data || {};
        setGeneral({
          storeName: data.storeName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
          logo: data.logo || '',
        });
      } else if (activeTab === 'payment') {
        const res = await settingsAPI.payment();
        const data = res.data?.data || res.data || {};
        setPayment({
          acceptedMethods: data.acceptedMethods || [],
          stripeKey: data.stripeKey || '',
          paypalClientId: data.paypalClientId || '',
          codEnabled: data.codEnabled !== false,
        });
      } else if (activeTab === 'delivery') {
        const res = await settingsAPI.delivery();
        const data = res.data?.data || res.data || {};
        setDelivery({
          zones: Array.isArray(data.zones) ? data.zones : [],
          baseFee: data.baseFee ?? '',
          freeDeliveryThreshold: data.freeDeliveryThreshold ?? '',
        });
      } else if (activeTab === 'features') {
        const res = await settingsAPI.getByName('feature-flags');
        const data = res.data?.data || res.data || {};
        setFeatures(data.flags || data.features || data);
      } else if (activeTab === 'maintenance') {
        const res = await settingsAPI.getByName('maintenance');
        const data = res.data?.data || res.data || {};
        setMaintenance({ enabled: data.enabled || false, message: data.message || '' });
      }
    } catch {
      toast.error('Failed to load settings');
    }
    setLoading(false);
  };

  useEffect(() => { loadTab(); }, [activeTab]);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.updateGeneral(general);
      toast.success('General settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.updatePayment(payment);
      toast.success('Payment settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.updateDelivery({
        ...delivery,
        baseFee: delivery.baseFee !== '' ? Number(delivery.baseFee) : undefined,
        freeDeliveryThreshold: delivery.freeDeliveryThreshold !== '' ? Number(delivery.freeDeliveryThreshold) : undefined,
      });
      toast.success('Delivery settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleToggleFeature = async (flag) => {
    const newValue = !features[flag];
    setFeatures(prev => ({ ...prev, [flag]: newValue }));
    try {
      await settingsAPI.toggleFeature(flag, newValue);
      toast.success(`Feature "${flag}" ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle feature');
      setFeatures(prev => ({ ...prev, [flag]: !newValue }));
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !maintenance.enabled;
    setMaintenance(prev => ({ ...prev, enabled: newValue }));
    try {
      await settingsAPI.toggleMaintenance(newValue);
      toast.success(`Maintenance mode ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle maintenance');
      setMaintenance(prev => ({ ...prev, enabled: !newValue }));
    }
  };

  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.toggleMaintenance(maintenance.enabled);
      await settingsAPI.update({ maintenance });
      toast.success('Maintenance settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const togglePaymentMethod = (method) => {
    setPayment(prev => ({
      ...prev,
      acceptedMethods: prev.acceptedMethods.includes(method)
        ? prev.acceptedMethods.filter(m => m !== method)
        : [...prev.acceptedMethods, method],
    }));
  };

  const addDeliveryZone = () => {
    setDelivery(prev => ({ ...prev, zones: [...prev.zones, { name: '', fee: '' }] }));
  };

  const removeDeliveryZone = (index) => {
    setDelivery(prev => ({ ...prev, zones: prev.zones.filter((_, i) => i !== index) }));
  };

  const updateDeliveryZone = (index, field, value) => {
    setDelivery(prev => ({
      ...prev,
      zones: prev.zones.map((z, i) => i === index ? { ...z, [field]: value } : z),
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your store"
        breadcrumbs={['Dashboard', 'Settings']}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <LoadingOverlay isLoading={loading} message="Loading settings...">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl">
                  <h3 className="font-semibold dark:text-white text-lg mb-4">General Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                    <input value={general.storeName} onChange={e => setGeneral({ ...general, storeName: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="My Store" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                      <input type="email" value={general.contactEmail} onChange={e => setGeneral({ ...general, contactEmail: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="contact@store.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                      <input value={general.contactPhone} onChange={e => setGeneral({ ...general, contactPhone: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="+1234567890" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea value={general.address} onChange={e => setGeneral({ ...general, address: e.target.value })} rows={3} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="Store address..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
                    <input value={general.logo} onChange={e => setGeneral({ ...general, logo: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="https://..." />
                  </div>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'payment' && (
                <form onSubmit={handleSavePayment} className="space-y-5 max-w-2xl">
                  <h3 className="font-semibold dark:text-white text-lg mb-4">Payment Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accepted Payment Methods</label>
                    <div className="flex flex-wrap gap-3">
                      {['cash_on_delivery', 'credit_card', 'debit_card', 'stripe', 'paypal', 'wallet'].map(method => (
                        <label key={method} className="flex items-center gap-2 px-3 py-2 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <input
                            type="checkbox"
                            checked={payment.acceptedMethods.includes(method)}
                            onChange={() => togglePaymentMethod(method)}
                            className="rounded"
                          />
                          <span className="text-sm dark:text-gray-300 capitalize">{method.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stripe Publishable Key</label>
                      <input value={payment.stripeKey} onChange={e => setPayment({ ...payment, stripeKey: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="pk_..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PayPal Client ID</label>
                      <input value={payment.paypalClientId} onChange={e => setPayment({ ...payment, paypalClientId: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="PayPal client ID" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                    <input type="checkbox" checked={payment.codEnabled} onChange={e => setPayment({ ...payment, codEnabled: e.target.checked })} className="rounded" />
                    Enable Cash on Delivery
                  </label>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'delivery' && (
                <form onSubmit={handleSaveDelivery} className="space-y-5 max-w-2xl">
                  <h3 className="font-semibold dark:text-white text-lg mb-4">Delivery Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Delivery Fee</label>
                      <input type="number" step="0.01" value={delivery.baseFee} onChange={e => setDelivery({ ...delivery, baseFee: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Free Delivery Threshold</label>
                      <input type="number" step="0.01" value={delivery.freeDeliveryThreshold} onChange={e => setDelivery({ ...delivery, freeDeliveryThreshold: e.target.value })} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Zones</label>
                      <button type="button" onClick={addDeliveryZone} className="text-primary-600 text-sm hover:underline">+ Add Zone</button>
                    </div>
                    {delivery.zones.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-3">No delivery zones configured</p>
                    ) : (
                      <div className="space-y-2">
                        {delivery.zones.map((zone, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={zone.name}
                              onChange={e => updateDeliveryZone(i, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                              placeholder="Zone name"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={zone.fee}
                              onChange={e => updateDeliveryZone(i, 'fee', e.target.value)}
                              className="w-32 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                              placeholder="Fee"
                            />
                            <button type="button" onClick={() => removeDeliveryZone(i)} className="text-red-500 hover:text-red-700">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'features' && (
                <div className="space-y-5">
                  <h3 className="font-semibold dark:text-white text-lg mb-4">Feature Flags</h3>
                  {Object.keys(features).length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No feature flags configured</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(features).map(([flag, enabled]) => (
                        <div key={flag} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white capitalize">{flag.replace(/_/g, ' ')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFeature(flag)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-5 max-w-2xl">
                  <h3 className="font-semibold dark:text-white text-lg mb-4">Maintenance Mode</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Enable Maintenance Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">When enabled, customers will see a maintenance message</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleMaintenance}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        maintenance.enabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        maintenance.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {maintenance.enabled && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">Maintenance mode is active</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Message</label>
                    <textarea
                      value={maintenance.message}
                      onChange={e => setMaintenance({ ...maintenance, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="We are currently undergoing maintenance. Please check back later."
                    />
                  </div>
                  <button type="button" onClick={handleSaveMaintenance} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
}
