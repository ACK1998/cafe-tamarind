import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import { apiCallWithRetry } from '../utils/apiHelpers';

// Get API base URL - use current origin if accessing from network (not localhost)
const getApiBaseUrl = () => {
  // If we're accessing from a network IP (not localhost), use the same origin for API
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    // If accessing via IP address (not localhost), use same origin for API
    if (currentOrigin.includes('192.168.') || currentOrigin.includes('10.') || currentOrigin.includes('172.')) {
      // Replace frontend port with backend port
      const apiUrl = currentOrigin.replace(':3006', ':5006') + '/api';
      console.log('🌐 Using network API URL:', apiUrl);
      return apiUrl;
    }
  }
  // Default to configured API URL
  return API_CONFIG.BASE_URL;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create customer axios instance with base configuration
const customerApi = axios.create({
  baseURL: getApiBaseUrl(),
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
  getAdminCustomerOrders: (params = {}) => apiCallWithRetry(() => api.get('/orders/admin/customer', { params })),
  getAdminInHouseOrders: (params = {}) => apiCallWithRetry(() => api.get('/orders/admin/inhouse', { params })),
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
  getByRole: (role) => apiCallWithRetry(() => api.get(`/admin/users/role/${role}`)),
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

// Review API calls (order-level reviews)
export const reviewAPI = {
  // Generate review token for an order
  generateToken: (orderId) => apiCallWithRetry(() => api.post('/reviews/generate-token', { orderId })),
  
  // Validate review token and get order details
  validateToken: (token) => apiCallWithRetry(() => 
    api.get('/reviews/validate-token', { params: { token } })
  ),
  
  // Submit order review
  submit: (reviewData) => apiCallWithRetry(() => api.post('/reviews/submit', reviewData)),
  
  // Get review by order ID
  getOrderReview: (orderId) => apiCallWithRetry(() => api.get(`/reviews/order/${orderId}`)),
  
  // Admin: Get all reviews
  getAll: (params = {}) => apiCallWithRetry(() => api.get('/reviews/admin/all', { params })),
};

export default api;
