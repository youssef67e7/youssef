import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const SA = `${API_BASE}/super-admin`;

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
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post(`${SA}/auth/login`, { email, password }),
  verifyMfa: (code, sessionToken) => api.post(`${SA}/auth/verify-mfa`, { code, sessionToken }),
  logout: () => api.post(`${SA}/auth/logout`),
  profile: () => api.get(`${SA}/auth/profile`),
};

export const dashboardAPI = {
  stats: () => api.get(`${SA}/dashboard/stats`),
  revenue: (params) => api.get(`${SA}/dashboard/revenue`, { params }),
  orders: (params) => api.get(`${SA}/dashboard/orders`, { params }),
  systemHealth: () => api.get(`${SA}/dashboard/system-health`),
  alerts: () => api.get(`${SA}/dashboard/alerts`),
};

export const pharmaciesAPI = {
  list: (params) => api.get(`${SA}/pharmacies`, { params }),
  get: (id) => api.get(`${SA}/pharmacies/${id}`),
  metrics: (id) => api.get(`${SA}/pharmacies/${id}/metrics`),
  toggle: (id) => api.post(`${SA}/pharmacies/${id}/toggle`),
};

export const usersAPI = {
  list: (params) => api.get(`${SA}/users`, { params }),
  get: (id) => api.get(`${SA}/users/${id}`),
  history: (id) => api.get(`${SA}/users/${id}/history`),
  toggle: (id) => api.post(`${SA}/users/${id}/toggle`),
  assignRole: (id, roleId) => api.put(`${SA}/users/${id}/role`, { roleId }),
};

export const rolesAPI = {
  list: () => api.get(`${SA}/roles`),
  create: (data) => api.post(`${SA}/roles`, data),
  update: (id, data) => api.put(`${SA}/roles/${id}`, data),
  delete: (id) => api.delete(`${SA}/roles/${id}`),
};

export const permissionsAPI = {
  list: () => api.get(`${SA}/permissions`),
  matrix: () => api.get(`${SA}/roles/permission-matrix`),
  updateMatrix: (data) => api.put(`${SA}/roles/permission-matrix`, data),
};

export const featureFlagsAPI = {
  list: () => api.get(`${SA}/feature-flags`),
  create: (data) => api.post(`${SA}/feature-flags`, data),
  update: (id, data) => api.put(`${SA}/feature-flags/${id}`, data),
  toggle: (id) => api.post(`${SA}/feature-flags/${id}/toggle`),
  delete: (id) => api.delete(`${SA}/feature-flags/${id}`),
};

export const maintenanceAPI = {
  status: () => api.get(`${SA}/maintenance`),
  toggle: () => api.post(`${SA}/maintenance/toggle`),
  schedule: (data) => api.post(`${SA}/maintenance/schedule`, data),
};

export const configAPI = {
  getAll: () => api.get(`${SA}/config`),
  getSection: (section) => api.get(`${SA}/config/${section}`),
  updateSection: (section, data) => api.put(`${SA}/config/${section}`, data),
};

export const auditLogsAPI = {
  list: (params) => api.get(`${SA}/audit-logs`, { params }),
  export: (params) => api.get(`${SA}/audit-logs/export`, { params }),
};

export const analyticsAPI = {
  crossBranch: (params) => api.get(`${SA}/analytics/cross-branch`, { params }),
  revenue: (params) => api.get(`${SA}/analytics/revenue`, { params }),
  users: (params) => api.get(`${SA}/analytics/users`, { params }),
  geographic: (params) => api.get(`${SA}/analytics/geographic`, { params }),
};

export const reportsAPI = {
  list: () => api.get(`${SA}/reports`),
  generate: (data) => api.post(`${SA}/reports/generate`, data),
  export: (id, format) => api.get(`${SA}/reports/export/${id}`, { params: { format } }),
};

export const systemHealthAPI = {
  overview: () => api.get(`${SA}/system-health`),
  api: () => api.get(`${SA}/system-health/api`),
  database: () => api.get(`${SA}/system-health/database`),
  cache: () => api.get(`${SA}/system-health/cache`),
  sessions: () => api.get(`${SA}/system-health/sessions`),
};

export default api;
