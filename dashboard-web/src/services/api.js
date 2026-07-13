import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dashboard_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dashboard_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile/update', data),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  revenue: (params) => api.get('/dashboard/revenue', { params }),
  ordersChart: (params) => api.get('/dashboard/orders-chart', { params }),
  topMedicines: (params) => api.get('/dashboard/top-medicines', { params }),
  customerGrowth: (params) => api.get('/dashboard/customer-growth', { params }),
  inventoryAlerts: () => api.get('/dashboard/inventory-alerts'),
  orderStatusDistribution: () => api.get('/dashboard/order-status-distribution'),
  recentOrders: (params) => api.get('/dashboard/recent-orders', { params }),
};

export const medicinesAPI = {
  list: (params) => api.get('/medicines', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  bulkDelete: (ids) => api.post('/medicines/bulk', { action: 'delete', ids }),
  bulkActivate: (ids) => api.post('/medicines/bulk', { action: 'activate', ids }),
  bulkDeactivate: (ids) => api.post('/medicines/bulk', { action: 'deactivate', ids }),
  search: (params) => api.get('/medicines/search', { params }),
  import: (fd) => api.post('/medicines/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  export: (params) => api.get('/medicines/export', { params }),
};

export const categoriesAPI = {
  list: (params) => api.get('/categories', { params }),
  tree: () => api.get('/categories/tree'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (ids) => api.post('/categories/reorder', { order: ids }),
};

export const brandsAPI = {
  list: (params) => api.get('/brands', { params }),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/status/${id}`, { status }),
  assignDriver: (orderId, driverId) => api.post(`/orders/assign-driver/${orderId}`, { driverId }),
  getDrivers: (params) => api.get('/orders/drivers', { params }),
  getInvoice: (id) => api.get(`/orders/invoice/${id}`),
};

export const customersAPI = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/detail/${id}`),
  block: (id, reason) => api.patch(`/customers/block/${id}`, reason ? { reason } : {}),
  unblock: (id) => api.patch(`/customers/unblock/${id}`),
  toggleBlock: (id) => api.put(`/customers/block/${id}/toggle`),
  orders: (id, params) => api.get(`/customers/orders/${id}`, { params }),
};

export const driversAPI = {
  list: (params) => api.get('/drivers', { params }),
  get: (id) => api.get(`/drivers/detail/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  earnings: (id, params) => api.get(`/drivers/earnings/${id}`, { params }),
  deliveries: (id, params) => api.get(`/drivers/deliveries/${id}`, { params }),
  setOnline: (id, isOnline) => api.patch(`/drivers/online-status/${id}`, { isOnline }),
};

export const couponsAPI = {
  list: (params) => api.get('/coupons', { params }),
  stats: () => api.get('/coupons/stats'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  toggleActive: (id) => api.patch(`/coupons/${id}/toggle-active`),
};

export const offersAPI = {
  list: (params) => api.get('/offers', { params }),
  scheduled: (params) => api.get('/offers/scheduled', { params }),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  toggleActive: (id) => api.patch(`/offers/${id}/toggle-active`),
};

export const bannersAPI = {
  list: (params) => api.get('/banners', { params }),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  reorder: (ids) => api.post('/banners/reorder', { order: ids }),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  approve: (id) => api.patch(`/reviews/approve/${id}`),
  reject: (id) => api.patch(`/reviews/reject/${id}`),
  reply: (id, reply) => api.post(`/reviews/reply/${id}`, { reply }),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  send: (data) => api.post('/notifications/send', data),
  sendAll: (data) => api.post('/notifications/send-all', data),
  delete: (id) => api.delete(`/notifications/${id}`),
  history: (params) => api.get('/notifications/history', { params }),
};

export const returnsAPI = {
  list: (params) => api.get('/returns', { params }),
  approve: (id) => api.patch(`/returns/approve/${id}`),
  reject: (id, reason) => api.patch(`/returns/reject/${id}`, reason ? { reason } : {}),
  processRefund: (id, data) => api.post(`/returns/refund/${id}`, data),
};

export const analyticsAPI = {
  dashboard: (params) => api.get('/analytics', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  orders: (params) => api.get('/analytics/orders', { params }),
  customers: (params) => api.get('/analytics/customers', { params }),
  compare: (data) => api.post('/analytics/compare', data),
  export: (params) => api.get('/analytics/export', { params }),
};

export const reportsAPI = {
  list: (params) => api.get('/reports', { params }),
  generate: (data) => api.post('/reports/generate', data),
  download: (id, params) => api.get(`/reports/download/${id}`, { params, responseType: 'blob' }),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const auditLogAPI = {
  list: (params) => api.get('/audit-log', { params }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getByName: (name) => api.get(`/settings/${name}`),
  general: () => api.get('/settings/general'),
  updateGeneral: (data) => api.put('/settings/general', data),
  payment: () => api.get('/settings/payment'),
  updatePayment: (data) => api.put('/settings/payment', data),
  delivery: () => api.get('/settings/delivery'),
  updateDelivery: (data) => api.put('/settings/delivery', data),
  toggleFeature: (flag, enabled) => api.patch(`/settings/feature-flags/${flag}`, { enabled }),
  toggleMaintenance: (enabled) => api.patch('/settings/maintenance', { enabled }),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  roles: () => api.get('/users/roles'),
  permissions: () => api.get('/users/permissions'),
};

export default api;
