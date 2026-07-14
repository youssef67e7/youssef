import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('super_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('super_admin_token');
      window.location.href = '/super-admin/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyMfa: (code, mfaToken) => api.post('/auth/verify-mfa', { code, mfaToken }),
  profile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const dashboardAPI = {
  stats: () => api.get('/analytics/dashboard'),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  orders: (params) => api.get('/orders', { params }),
  systemHealth: () => api.get('/health'),
  alerts: () => api.get('/notifications'),
};

export const pharmaciesAPI = {
  list: (params) => api.get('/users', { params: { ...params, role: 'ADMIN' } }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', { ...data, role: 'ADMIN' }),
  toggle: (id) => api.patch(`/users/${id}`),
  metrics: (id) => api.get(`/users/${id}`),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  history: (id) => api.get(`/users/${id}`),
  toggle: (id) => api.patch(`/users/${id}`),
  assignRole: (id, role) => api.patch(`/users/${id}`, { role }),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const medicinesAPI = {
  list: (params) => api.get('/medicines', { params }),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.patch(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

export const categoriesAPI = {
  list: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const brandsAPI = {
  list: (params) => api.get('/brands', { params }),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.patch(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const deliveryAPI = {
  list: (params) => api.get('/delivery', { params }),
  assign: (data) => api.post('/delivery/assign', data),
};

export const couponsAPI = {
  list: (params) => api.get('/coupons', { params }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  updateStatus: (id, status) => api.patch(`/reviews/${id}/status`, { status }),
  adminReply: (id, reply) => api.post(`/reviews/${id}/admin-reply`, { reply }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  sendBulk: (data) => api.post('/notifications/send-bulk', data),
  sendToAll: (data) => api.post('/notifications/send-to-all', data),
};

export const returnsAPI = {
  list: (params) => api.get('/returns/admin/returns', { params }),
  updateStatus: (id, status) => api.patch(`/returns/admin/returns/${id}/status`, { status }),
};

export const analyticsAPI = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  sales: (params) => api.get('/analytics/sales', { params }),
  users: (params) => api.get('/analytics/users', { params }),
  inventory: (params) => api.get('/analytics/inventory', { params }),
  crossBranch: (params) => api.get('/analytics/revenue', { params }),
  geographic: (params) => api.get('/analytics/sales', { params }),
};

export const reportsAPI = {
  list: () => api.get('/reports/sales'),
  sales: (params) => api.get('/reports/sales', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
  inventory: (params) => api.get('/reports/inventory', { params }),
  users: (params) => api.get('/reports/users', { params }),
  generate: (data) => api.post('/reports/sales', data),
  export: (id, format) => api.get('/reports/sales', { params: { id, format }, responseType: 'blob' }),
  delete: () => Promise.resolve(),
};

export const systemHealthAPI = {
  overview: () => api.get('/health'),
  api: () => api.get('/health'),
  database: () => api.get('/health'),
  cache: () => api.get('/health'),
  sessions: () => api.get('/health'),
};

export const auditLogsAPI = {
  list: (params) => api.get('/audit-log', { params }),
  export: (params) => api.get('/audit-log', { params }),
};

export const systemSettingsAPI = {
  getPublic: () => api.get('/system-settings/public'),
  getAll: (params) => api.get('/system-settings', { params }),
  create: (data) => api.post('/system-settings', data),
  bulk: (data) => api.post('/system-settings/bulk', data),
};

export const featureFlagsAPI = {
  list: () => api.get('/system-settings', { params: { prefix: 'feature_' } }),
  create: (data) => api.post('/system-settings', { key: `feature_${data.name}`, value: JSON.stringify(data) }),
  update: (id, data) => api.patch(`/system-settings/${id}`, data),
  toggle: (id) => api.patch(`/system-settings/${id}`),
  delete: (id) => api.delete(`/system-settings/${id}`),
};

export const maintenanceAPI = {
  status: () => api.get('/system-settings', { params: { key: 'maintenance_mode' } }),
  toggle: () => api.post('/system-settings', { key: 'maintenance_mode', value: JSON.stringify({ enabled: true }) }),
  schedule: (data) => api.post('/system-settings', { key: 'maintenance_schedule', value: JSON.stringify(data) }),
  update: (data) => api.post('/system-settings', { key: 'maintenance_message', value: JSON.stringify(data) }),
};

export const configAPI = {
  getAll: () => api.get('/system-settings'),
  getSection: (section) => api.get('/system-settings', { params: { section } }),
  updateSection: (section, data) =>
    api.post('/system-settings/bulk', {
      settings: Object.entries(data).map(([k, v]) => ({ key: `${section}_${k}`, value: String(v) })),
    }),
};

export const rolesAPI = {
  list: async () => {
    const res = await api.get('/users');
    const users = res.data?.data || [];
    const roleDefs = [
      { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true, perms: 15 },
      { name: 'ADMIN', description: 'System administration', isSystem: true, perms: 12 },
      { name: 'PHARMACIST', description: 'Pharmacy operations', isSystem: true, perms: 8 },
      { name: 'DRIVER', description: 'Delivery operations', isSystem: true, perms: 3 },
      { name: 'CUSTOMER', description: 'Customer access', isSystem: true, perms: 1 },
    ];
    const arr = Array.isArray(users) ? users : [];
    const roles = roleDefs.map((r, i) => ({
      id: String(i + 1),
      name: r.name,
      description: r.description,
      permissions: r.perms,
      userCount: arr.filter(u => u.role === r.name).length,
      isSystem: r.isSystem,
    })).filter(r => r.userCount > 0 || r.name === 'SUPER_ADMIN' || r.name === 'ADMIN');
    return { data: { data: roles } };
  },
  create: (data) => Promise.reject({ response: { data: { message: 'Roles are managed by the backend' } } }),
  update: (id, data) => Promise.reject({ response: { data: { message: 'Roles are managed by the backend' } } }),
  delete: (id) => Promise.reject({ response: { data: { message: 'Roles are managed by the backend' } } }),
};

export const permissionsAPI = {
  list: () => Promise.resolve({ data: { data: [
    'users.view', 'users.manage', 'medicines.view', 'medicines.create', 'medicines.edit', 'medicines.delete',
    'orders.view', 'orders.manage', 'coupons.manage', 'reports.view', 'analytics.view', 'settings.manage',
  ] } }),
  matrix: () => Promise.resolve({ data: { data: {} } }),
  updateMatrix: (data) => Promise.resolve({ data: { success: true } }),
};

export default api;
