import axios from 'axios';
import toast from 'react-hot-toast';

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
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('dashboard_token');
      window.location.href = '/dashboard/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyMfa: (data) => api.post('/auth/verify-mfa', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  getMe: () => api.get('/users/me'),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/auth/register', data),
  updateMe: (data) => api.patch('/users/me', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  roles: () => Promise.resolve({ data: { data: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DRIVER', 'CUSTOMER'] } }),
};

export const medicinesAPI = {
  list: (params) => api.get('/medicines', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.patch(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  updateStock: (id, data) => api.patch(`/medicines/${id}/stock`, data),
  lowStock: (params) => api.get('/medicines/low-stock', { params }),
  expiring: (params) => api.get('/medicines/expiring', { params }),
};

export const categoriesAPI = {
  list: (params) => api.get('/categories', { params }),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (ids) => Promise.resolve({ data: { success: true } }),
};

export const brandsAPI = {
  list: (params) => api.get('/brands', { params }),
  get: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.patch(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  myOrders: (params) => api.get('/orders/my-orders', { params }),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  assignDriver: (orderId, driverId) => api.post(`/orders/${orderId}/assign-driver`, { driverId }),
  getInvoice: (orderId) => api.get(`/orders/${orderId}/invoice`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const deliveryAPI = {
  list: (params) => api.get('/delivery', { params }),
  assign: (data) => api.post('/delivery/assign', data),
  availableDrivers: () => api.get('/delivery/available-drivers'),
  updateStatus: (id, status) => api.patch(`/delivery/${id}/status`, { status }),
  updateLocation: (id, location) => api.patch(`/delivery/${id}/location`, location),
};

export const couponsAPI = {
  list: (params) => api.get('/coupons', { params }),
  get: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  toggleActive: (id, data) => api.patch(`/coupons/${id}`, { isActive: data?.isActive !== undefined ? data.isActive : true }),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  listByMedicine: (medicineId, params) => api.get(`/reviews/medicine/${medicineId}`, { params }),
  create: (data) => api.post('/reviews', data),
  approve: (id) => api.patch(`/reviews/${id}/status`, { status: 'APPROVED' }),
  reject: (id) => api.patch(`/reviews/${id}/status`, { status: 'REJECTED' }),
  adminReply: (id, reply) => api.post(`/reviews/${id}/admin-reply`, { reply }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  history: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  send: (data) => api.post('/notifications/send-bulk', data),
  sendBulk: (data) => api.post('/notifications/send-bulk', data),
  sendToAll: (data) => api.post('/notifications/send-to-all', data),
  sendAll: (data) => api.post('/notifications/send-to-all', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const returnsAPI = {
  list: (params) => api.get('/returns/admin/returns', { params }),
  myReturns: (params) => api.get('/returns/my-returns', { params }),
  createReturn: (data) => api.post('/returns/return-request', data),
  approve: (id) => api.patch(`/returns/admin/returns/${id}/status`, { status: 'approved' }),
  reject: (id, reason) => api.patch(`/returns/admin/returns/${id}/status`, { status: 'rejected', reason }),
  processRefund: (data) => api.post('/returns/refund', data),
};

export const analyticsAPI = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  sales: (params) => api.get('/analytics/sales', { params }),
  orders: (params) => api.get('/analytics/dashboard', { params }),
  customers: (params) => api.get('/analytics/users', { params }),
  users: (params) => api.get('/analytics/users', { params }),
  inventory: (params) => api.get('/analytics/inventory', { params }),
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

export const reportsAPI = {
  list: (params) => api.get('/reports/sales', { params }),
  sales: (params) => api.get('/reports/sales', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
  inventory: (params) => api.get('/reports/inventory', { params }),
  users: (params) => api.get('/reports/users', { params }),
  generate: (data) => api.post('/reports/sales', data),
  download: (id) => api.get('/reports/export/sales', { responseType: 'blob' }),
  delete: (id) => Promise.resolve({ data: { success: true } }),
  exportSales: (params) => api.get('/reports/export/sales', { params, responseType: 'blob' }),
};

export const auditLogAPI = {
  list: (params) => api.get('/audit-log', { params }),
};

export const settingsAPI = {
  get: () => api.get('/system-settings'),
  public: () => api.get('/system-settings/public'),
  update: (data) => api.post('/system-settings', data),
  updateBulk: (data) => api.post('/system-settings/bulk', data),
  general: () => api.get('/system-settings'),
  payment: () => api.get('/system-settings'),
  delivery: () => api.get('/system-settings'),
  getByName: (name) => api.get(`/system-settings/${name}`),
  updateGeneral: (data) => api.post('/system-settings/bulk', data),
  updatePayment: (data) => api.post('/system-settings/bulk', data),
  updateDelivery: (data) => api.post('/system-settings/bulk', data),
  toggleFeature: (flag, value) => api.post('/system-settings', { key: `feature_${flag}`, value: String(value), type: 'boolean' }),
  toggleMaintenance: (enabled) => api.post('/system-settings/maintenance', { enabled }),
};

export const customersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  toggleBlock: (id) => api.patch(`/users/${id}`, { isActive: false }),
  unblock: (id) => api.patch(`/users/${id}`, { isActive: true }),
  orders: (id, params) => api.get('/orders', { params: { ...params, user: id } }),
};

export const driversAPI = {
  list: (params) => api.get('/drivers', { params }),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.patch(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  setOnline: (id, isOnline) => api.patch(`/drivers/${id}/online`, { isOnline }),
  earnings: (id) => api.get(`/drivers/${id}/earnings`),
  deliveries: (id, params) => api.get('/delivery', { params: { driver: id, ...params } }),
};

export const bannersAPI = {
  list: (params) => api.get('/banners', { params }),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.patch(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  reorder: (ids) => Promise.resolve({ data: { success: true } }),
};

export const offersAPI = {
  list: (params) => api.get('/offers', { params }),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.patch(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  toggleActive: (id) => api.patch(`/offers/${id}`, { isActive: true }),
  scheduled: () => api.get('/offers'),
};

export const staffAPI = {
  list: (params) => api.get('/staff', { params }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const promotionsAPI = {
  list: (params) => api.get('/promotions', { params }),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.patch(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
  toggleActive: (id) => api.patch(`/promotions/${id}/toggle`),
};

export default api;
