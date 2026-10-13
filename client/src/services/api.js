// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and append Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agriconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout on unauthorized if needed
      // localStorage.removeItem('agriconnect_token');
      // localStorage.removeItem('agriconnect_user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.patch(`/products/${id}`, data),
};

export const orderAPI = {
  placeOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData),
  updateDeliveryStatus: (id, deliveryData) => api.post(`/deliveries/${id}/status`, deliveryData),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  verifyUser: (id, status) => api.patch(`/admin/users/${id}/verify`, { status }),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getStats: () => api.get('/admin/stats'),
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
};

export default api;
