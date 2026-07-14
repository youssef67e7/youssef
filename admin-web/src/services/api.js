import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const dashboardAPI = {
  stats: () => api.get('/analytics/dashboard'),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const medicinesAPI = {
  list: (params) => api.get('/medicines', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.patch(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  updateStock: (id, data) => api.patch(`/medicines/${id}/stock`, data),
  lowStock: (params) => api.get('/medicines/low-stock', { params }),
};

export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const categoriesAPI = {
  list: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const brandsAPI = {
  list: (params) => api.get('/brands', { params }),
  get: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.patch(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const couponsAPI = {
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const deliveryAPI = {
  list: (params) => api.get('/delivery', { params }),
  assign: (data) => api.post('/delivery/assign', data),
  updateStatus: (id, status) => api.patch(`/delivery/${id}/status`, { status }),
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

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  sendBulk: (data) => api.post('/notifications/send-bulk', data),
  sendToAll: (data) => api.post('/notifications/send-to-all', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const reportsAPI = {
  list: (params) => api.get('/reports', { params }),
  sales: (params) => api.get('/reports/sales', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
  inventory: (params) => api.get('/reports/inventory', { params }),
  users: (params) => api.get('/reports/users', { params }),
};

export const returnsAPI = {
  list: (params) => api.get('/returns/admin/returns', { params }),
  updateStatus: (id, status, reason) => api.patch(`/returns/admin/returns/${id}/status`, { status, ...(reason && { reason }) }),
  refund: (data) => api.post('/returns/refund', data),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  updateStatus: (id, status) => api.patch(`/reviews/${id}/status`, { status }),
  adminReply: (id, reply) => api.post(`/reviews/${id}/admin-reply`, { reply }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  sales: (params) => api.get('/analytics/sales', { params }),
  users: (params) => api.get('/analytics/users', { params }),
  inventory: (params) => api.get('/analytics/inventory', { params }),
};

export const uploadAPI = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (url) => api.delete('/upload/image', { data: { url } }),
};

export const settingsAPI = {
  get: () => api.get('/system-settings'),
  update: (data) => api.post('/system-settings', data),
  getByName: (name) => api.get(`/system-settings/${name}`),
};

export const staffAPI = {
  list: (params) => api.get('/staff', { params }),
  get: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const promotionsAPI = {
  list: (params) => api.get('/promotions', { params }),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.patch(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
};

export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const telemedicineAPI = {
  appointments: (params) => api.get('/telemedicine/appointments', { params }),
  doctors: (params) => api.get('/telemedicine/doctors', { params }),
  createDoctor: (data) => api.post('/telemedicine/doctors', data),
  updateDoctor: (id, data) => api.patch(`/telemedicine/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/telemedicine/doctors/${id}`),
  updateAppointment: (id, data) => api.patch(`/telemedicine/appointments/${id}`, data),
};

export const aiPrescriptionAPI = {
  analyze: (data) => api.post('/ai-prescriptions/analyze', data),
  history: (params) => api.get('/ai-prescriptions/history', { params }),
};

export default api;
