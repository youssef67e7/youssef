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
  verifyMfa: (data) => api.post('/auth/verify-mfa', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile/update', data),
};

export const dashboardAPI = {
  stats: () => api.get('/analytics/dashboard'),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  ordersChart: (params) => api.get('/analytics/sales', { params }),
  topMedicines: (params) => api.get('/analytics/dashboard', { params }),
  customerGrowth: (params) => api.get('/analytics/users', { params }),
  inventoryAlerts: () => api.get('/medicines/low-stock'),
  orderStatusDistribution: () => api.get('/analytics/dashboard'),
  recentOrders: (params) => api.get('/orders', { params: { limit: params?.limit || 5 } }),
};

export const medicinesAPI = {
  list: (params) => api.get('/medicines', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.patch(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  updateStock: (id, data) => api.patch(`/medicines/${id}/stock`, data),
  lowStock: () => api.get('/medicines/low-stock'),
  expiring: () => api.get('/medicines/expiring'),
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
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (ids) => api.post('/categories/reorder', { order: ids }),
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
  myOrders: (params) => api.get('/orders/my-orders', { params }),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  assignDriver: (orderId, driverId) => api.post(`/delivery/assign`, { orderId, driverId }),
  getDrivers: (params) => api.get('/drivers', { params }),
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
  validate: (params) => api.get('/coupons/validate', { params }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  toggleActive: (id) => api.patch(`/coupons/${id}/toggle-active`),
};

export const offersAPI = {
  list: (params) => api.get('/offers', { params }),
  active: (params) => api.get('/offers/active', { params }),
  scheduled: (params) => api.get('/offers/scheduled', { params }),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.patch(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  toggleActive: (id) => api.patch(`/offers/${id}/toggle-active`),
};

export const bannersAPI = {
  list: (params) => api.get('/banners', { params }),
  active: (params) => api.get('/banners/active', { params }),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.patch(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  reorder: (ids) => api.post('/banners/reorder', { order: ids }),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  listByMedicine: (medicineId, params) => api.get(`/reviews/medicine/${medicineId}`, { params }),
  create: (data) => api.post('/reviews', data),
  approve: (id) => api.patch(`/reviews/${id}`, { status: 'approved' }),
  reject: (id) => api.patch(`/reviews/${id}`, { status: 'rejected' }),
  delete: (id) => api.delete(`/reviews/${id}`),
  reply: (id, reply) => api.patch(`/reviews/${id}`, { reply }),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  send: (data) => api.post('/notifications/send-bulk', data),
  sendAll: (data) => api.post('/notifications/send-to-all', data),
  delete: (id) => api.delete(`/notifications/${id}`),
  history: (params) => api.get('/notifications', { params }),
};

export const returnsAPI = {
  list: (params) => api.get('/returns/admin/returns', { params }),
  myReturns: (params) => api.get('/returns/my-returns', { params }),
  createReturn: (data) => api.post('/returns/return-request', data),
  approve: (id) => api.patch(`/returns/admin/returns/${id}/status`, { status: 'approved' }),
  reject: (id, reason) => api.patch(`/returns/admin/returns/${id}/status`, { status: 'rejected', reason }),
  processRefund: (id, data) => api.post(`/returns/refund/${id}`, data),
};

export const analyticsAPI = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  sales: (params) => api.get('/analytics/sales', { params }),
  orders: (params) => api.get('/analytics/sales', { params }),
  customers: (params) => api.get('/analytics/users', { params }),
  inventory: (params) => api.get('/analytics/inventory', { params }),
  compare: (data) => api.post('/analytics/compare', data),
  export: (params) => api.get('/analytics/export', { params }),
};

export const reportsAPI = {
  sales: (params) => api.get('/reports/sales', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
  inventory: (params) => api.get('/reports/inventory', { params }),
  users: (params) => api.get('/reports/users', { params }),
  exportSales: (params) => api.get('/reports/export/sales', { params, responseType: 'blob' }),
  list: (params) => api.get('/reports', { params }),
  generate: (data) => api.post('/reports/generate', data),
  download: (id, params) => api.get(`/reports/download/${id}`, { params, responseType: 'blob' }),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const auditLogAPI = {
  list: (params) => api.get('/audit-log', { params }),
};

export const deliveryAPI = {
  list: (params) => api.get('/delivery', { params }),
  myDeliveries: (params) => api.get('/delivery/my-deliveries', { params }),
  assign: (data) => api.post('/delivery/assign', data),
  updateStatus: (id, status) => api.patch(`/delivery/${id}/status`, { status }),
  updateLocation: (id, location) => api.patch(`/delivery/${id}/location`, location),
};

export const settingsAPI = {
  get: () => api.get('/system-settings'),
  public: () => api.get('/system-settings/public'),
  update: (data) => api.post('/system-settings', data),
  updateBulk: (data) => api.post('/system-settings/bulk', data),
  getByName: (name) => api.get(`/system-settings`, { params: { key: name } }),
  general: () => api.get('/system-settings'),
  updateGeneral: (data) => api.post('/system-settings', data),
  payment: () => api.get('/system-settings'),
  updatePayment: (data) => api.post('/system-settings', data),
  delivery: () => api.get('/system-settings'),
  updateDelivery: (data) => api.post('/system-settings', data),
  toggleFeature: (flag, enabled) => api.post('/system-settings', { key: `feature_${flag}`, value: enabled }),
  toggleMaintenance: (enabled) => api.post('/system-settings', { key: 'maintenance_mode', value: enabled }),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  roles: () => api.get('/users/roles'),
  permissions: () => api.get('/users/permissions'),
};

export default api;
