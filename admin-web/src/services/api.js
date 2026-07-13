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
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
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
};

export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const categoriesAPI = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const brandsAPI = {
  list: () => api.get('/brands'),
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
  updateStatus: (id, status) => api.patch(`/delivery/${id}/status`, { status }),
};

export const notificationsAPI = {
  sendBulk: (data) => api.post('/notifications/send-bulk', data),
  sendToAll: (data) => api.post('/notifications/send-to-all', data),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  get: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const inventoryAPI = {
  list: (params) => api.get('/inventory', { params }),
  get: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.patch(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  lowStock: (params) => api.get('/inventory/low-stock', { params }),
  stockMovements: (id) => api.get(`/inventory/${id}/movements`),
};

export const promotionsAPI = {
  list: () => api.get('/promotions'),
  get: (id) => api.get(`/promotions/${id}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.patch(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
};

export const staffAPI = {
  list: (params) => api.get('/staff', { params }),
  get: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const aiPrescriptionAPI = {
  analyze: (data) => api.post('/ai/prescription/analyze', data),
  history: (params) => api.get('/ai/prescription', { params }),
  get: (id) => api.get(`/ai/prescription/${id}`),
};

export const telemedicineAPI = {
  appointments: (params) => api.get('/telemedicine/appointments', { params }),
  getAppointment: (id) => api.get(`/telemedicine/appointments/${id}`),
  updateAppointment: (id, data) => api.patch(`/telemedicine/appointments/${id}`, data),
  doctors: (params) => api.get('/telemedicine/doctors', { params }),
  createDoctor: (data) => api.post('/telemedicine/doctors', data),
  updateDoctor: (id, data) => api.patch(`/telemedicine/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/telemedicine/doctors/${id}`),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  orders: (params) => api.get('/analytics/orders', { params }),
  customers: (params) => api.get('/analytics/customers', { params }),
  export: (type, format) => api.get(`/analytics/export/${type}`, { params: { format } }),
};

export const reportsAPI = {
  list: () => api.get('/reports'),
  generate: (data) => api.post('/reports/generate', data),
  get: (id) => api.get(`/reports/${id}`),
  download: (id, format) => api.get(`/reports/${id}/download`, { params: { format }, responseType: 'blob' }),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/system-settings'),
  update: (data) => api.patch('/system-settings', data),
  getByName: (name) => api.get(`/system-settings/${name}`),
};

export const uploadAPI = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (url) => api.delete('/upload', { data: { url } }),
};

export const reviewsAPI = {
  list: (params) => api.get('/reviews', { params }),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  reject: (id) => api.patch(`/reviews/${id}/reject`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const driversAPI = {
  list: (params) => api.get('/drivers', { params }),
  get: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.patch(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

export const returnsAPI = {
  list: (params) => api.get('/returns', { params }),
  get: (id) => api.get(`/returns/${id}`),
  approve: (id) => api.patch(`/returns/${id}/approve`),
  reject: (id, reason) => api.patch(`/returns/${id}/reject`, { reason }),
  processRefund: (id) => api.post(`/returns/${id}/refund`),
};

export const offersAPI = {
  list: () => api.get('/offers'),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.patch(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

export const bannersAPI = {
  list: () => api.get('/banners'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.patch(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  reorder: (ids) => api.post('/banners/reorder', { ids }),
};

export default api;
