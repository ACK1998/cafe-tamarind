import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import { apiCallWithRetry } from '../utils/apiHelpers';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create customer axios instance with base configuration
const customerApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (admin)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to add customer auth token
customerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to admin login
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls (admin only)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  generateOTP: (phone) => api.post('/auth/generate-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
};

// Menu API calls
export const menuAPI = {
  getAll: (mealTime) => apiCallWithRetry(() => api.get(`/menu/${mealTime || ''}`)),
  getById: (id) => apiCallWithRetry(() => api.get(`/menu/item/${id}`)),
  getCategories: () => apiCallWithRetry(() => api.get('/menu/categories')),
  getByType: (type) => apiCallWithRetry(() => api.get(`/menu/admin/type/${type}`)),
  create: (itemData) => apiCallWithRetry(() => api.post('/menu', itemData)),
  update: (id, itemData) => apiCallWithRetry(() => api.put(`/menu/${id}`, itemData)),
  delete: (id) => apiCallWithRetry(() => api.delete(`/menu/${id}`)),
};

// Orders API calls
export const ordersAPI = {
  create: (orderData, headers = {}) => apiCallWithRetry(() => api.post('/orders', orderData, { headers })),
  createAdmin: (orderData) => apiCallWithRetry(() => api.post('/orders', orderData)),
  getById: (id) => apiCallWithRetry(() => api.get(`/orders/${id}`)),
  getCustomerOrders: (phone) => apiCallWithRetry(() => api.get(`/orders/customer/${phone}`)),
  getAll: (params) => {
    if (params?.endpoint) {
      return apiCallWithRetry(() => api.get(params.endpoint));
    }
    return apiCallWithRetry(() => api.get('/orders/admin/all', { params }));
  },
  getAdminCustomerOrders: () => apiCallWithRetry(() => api.get('/orders/admin/customer')),
  getAdminInHouseOrders: () => apiCallWithRetry(() => api.get('/orders/admin/inhouse')),
  updateStatus: (id, status) => apiCallWithRetry(() => api.put(`/orders/admin/${id}`, { status })),
};

// Customer API calls
export const customerAPI = {
  login: (credentials) => api.post('/customers/login', credentials),
  register: (customerData) => api.post('/customers/register', customerData),
  getProfile: () => customerApi.get('/customers/profile'),
  updateProfile: (profileData) => customerApi.put('/customers/profile', profileData),
  changePassword: (passwordData) => customerApi.put('/customers/change-password', passwordData),
  getOrders: () => customerApi.get('/customers/orders'),
};

// User Management API calls
export const userAPI = {
  getAll: () => apiCallWithRetry(() => api.get('/admin/users')),
  getAllWithTotals: () => apiCallWithRetry(() => api.get('/admin/customers/with-totals')),
  update: (userId, updates) => apiCallWithRetry(() => api.put(`/admin/users/${userId}`, updates)),
  delete: (userId) => apiCallWithRetry(() => api.delete(`/admin/users/${userId}`)),
  getOrders: (userId) => apiCallWithRetry(() => api.get(`/admin/users/${userId}/orders`)),
};

export const ledgerAPI = {
  listCustomerLedgers: (params = {}) => apiCallWithRetry(() => api.get('/ledger/customers', { params })),
  getCustomerLedgerByPhone: (phone, params = {}) => apiCallWithRetry(() => api.get(`/ledger/customers/phone/${phone}`, { params })),
  settleCustomerLedger: (ledgerId, payload = {}) => apiCallWithRetry(() => api.post(`/ledger/customers/${ledgerId}/settle`, payload)),
  listEmployeeLedgers: (params = {}) => apiCallWithRetry(() => api.get('/ledger/employees', { params })),
  lookupEmployeeLedger: (params = {}) => apiCallWithRetry(() => api.get('/ledger/employees/lookup', { params })),
  recordEmployeeSettlement: (ledgerId, payload) => apiCallWithRetry(() => api.post(`/ledger/employees/${ledgerId}/settlements`, payload)),
};

// Feedback API calls
export const feedbackAPI = {
  // Customer feedback operations (public)
  submit: (feedbackData) => apiCallWithRetry(() => api.post('/feedback', feedbackData)),
  canReview: (orderId, customerPhone) => apiCallWithRetry(() => 
    api.get(`/feedback/can-review/${orderId}`, { params: { customerPhone } })
  ),
  getOrderFeedback: (orderId, customerPhone) => apiCallWithRetry(() => 
    api.get(`/feedback/order/${orderId}`, { params: { customerPhone } })
  ),
  getMenuItemFeedback: (menuItemId, params = {}) => apiCallWithRetry(() => 
    api.get(`/feedback/item/${menuItemId}`, { params })
  ),
  
  // Admin feedback operations
  getAll: (params = {}) => apiCallWithRetry(() => api.get('/feedback/admin/all', { params })),
  getAnalytics: (period = '30d') => apiCallWithRetry(() => 
    api.get('/feedback/admin/analytics', { params: { period } })
  ),
  delete: (feedbackId) => apiCallWithRetry(() => api.delete(`/feedback/admin/${feedbackId}`)),
};

export default api;
