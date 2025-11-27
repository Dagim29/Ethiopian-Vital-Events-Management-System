import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_CONFIG = {
  baseURL: 'http://localhost:5000', // Base URL without /api
  timeout: 30000, // 30 seconds
  withCredentials: true, // For cookies and auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 2xx and 4xx responses
  }
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend API URL with /api prefix
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 2xx and 4xx responses
  }
});

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// If in development, you might want to log more details
if (isDevelopment) {
  console.log('API Configuration:', API_CONFIG);
}

// Add request interceptor to log requests
const requestInterceptor = config => {
  // Add timestamp to each request
  config.headers['x-request-timestamp'] = new Date().toISOString();
  
  // Remove _t parameter from URL if present in params
  if (config.params && config.params._t) {
    delete config.params._t;
  }
  
  return config;
};

// Add response interceptor to handle errors
const responseInterceptor = error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('Response error:', error.response.status, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request
    console.error('Request error:', error.message);
  }
  return Promise.reject(error);
};

// Add interceptors
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(response => response, responseInterceptor);

// Error messages mapping
const ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection.',
  timeout: 'Request timeout. Please try again.',
  server: 'Server error. Please try again later.',
  unauthorized: 'Session expired. Please login again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  default: 'An error occurred. Please try again.',
};

// Request interceptor to add auth token and handle common headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Add auth header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    
    // Disable automatic cache busting as it adds _t parameter
    // which causes issues with the backend API
    // If cache busting is needed, handle it explicitly in the request
    
    if (isDevelopment) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('Request Error:', error);
    }
    toast.error(ERROR_MESSAGES.network);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response);
    }
    
    // Handle success messages if present in response
    // Don't show automatic success for auth endpoints (login/register)
    const isAuthEndpoint = response.config.url?.includes('/auth/');
    if (response.data?.message && response.config.showSuccess !== false && !isAuthEndpoint) {
      toast.success(response.data.message);
    }
    
    return response;
  },
  (error) => {
    const { response, config } = error;
    let errorMessage = ERROR_MESSAGES.default;
    let shouldShowError = true;
    let shouldLogout = false;

    if (isDevelopment) {
      console.error('API Error:', error);
    }

    if (!response) {
      // Handle network errors or timeouts
      if (error.code === 'ECONNABORTED') {
        errorMessage = ERROR_MESSAGES.timeout;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        errorMessage = ERROR_MESSAGES.network;
      }
    } else {
      // Handle HTTP status codes
      switch (response.status) {
        case 400:
          errorMessage = response.data?.message || 'Invalid request';
          break;
        case 401:
          errorMessage = ERROR_MESSAGES.unauthorized;
          shouldLogout = true;
          // Don't show error toast for login requests to prevent duplicate messages
          shouldShowError = !config?.url?.includes('/auth/');
          break;
        case 403:
          errorMessage = ERROR_MESSAGES.forbidden;
          break;
        case 404:
          errorMessage = ERROR_MESSAGES.notFound;
          break;
        case 408:
          errorMessage = 'Request timeout. The server took too long to respond.';
          break;
        case 500:
          errorMessage = ERROR_MESSAGES.server;
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'The server is currently unavailable. Please try again later.';
          break;
        default:
          errorMessage = response.data?.message || ERROR_MESSAGES.default;
      }
    }

    // Handle logout if needed
    if (shouldLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Show error toast if not explicitly disabled
    if (shouldShowError && errorMessage && config?.showError !== false) {
      toast.error(errorMessage, {
        toastId: `api-error-${config?.url}`,
        autoClose: 5000
      });
    }

    return Promise.reject({
      message: errorMessage,
      status: response?.status,
      data: response?.data,
      code: error.code,
      config: error.config,
      originalError: error
    });
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Check if the response indicates an error
      if (response.status !== 200 || response.data.error) {
        const errorMessage = response.data?.error || 'Invalid email or password';
        throw new Error(errorMessage);
      }
      
      // If login is successful, store the token
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        return response.data;
      } else {
        throw new Error('Login failed - no access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw with a user-friendly message
      throw new Error(error.response?.data?.error || error.message || 'Login failed. Please check your credentials.');
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // If registration is successful, store the token
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Get all users (admin only)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  // Create a new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  // Get admin dashboard statistics
  getAdminStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
  
  // Get officer dashboard statistics
  getOfficerStats: async () => {
    const response = await api.get('/users/officer-stats');
    return response.data;
  },
  
  // Get filtered statistics with historical data for reports
  getFilteredStats: async (filters = {}) => {
    const params = {
      region: filters.region || 'All Regions',
      record_type: filters.recordType || 'all',
      start_date: filters.startDate,
      end_date: filters.endDate
    };
    const response = await api.get('/users/filtered-stats', { params });
    return response.data;
  },
  
  // Update user status (approve/reject)
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },
  
  // Update own profile (any authenticated user)
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  // Change own password (any authenticated user)
  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
};

// Birth Records API
export const birthRecordsAPI = {
  getRecords: async (params = {}) => {
    try {
      // Set default pagination if not provided
      const queryParams = {
        page: 1,
        per_page: 20,
        search: ''  // Always include search parameter
      };
      
      // Update with provided params, ensuring we don't have undefined/null values
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams[key] = params[key];
        }
      });
      
      // Ensure search is always a string
      if (queryParams.search === undefined || queryParams.search === null) {
        queryParams.search = '';
      }
      
      console.log('Fetching birth records with params:', queryParams);
      
      // Build URL manually to avoid any automatic parameter manipulation
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `/births${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url, {
        withCredentials: true,
        // Disable any automatic parameter processing
        params: {},
        // Ensure no cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('API Response:', response); // Debug log
      
      // Handle the nested response format from the backend
      if (response.data) {
        // Format 1: Success with data wrapper (current backend format)
        if (response.data.success && response.data.data) {
          const { birth_records = [], pagination = {} } = response.data.data;
          return {
            birth_records: Array.isArray(birth_records) ? birth_records : [],
            total: pagination.total || 0,
            pages: pagination.pages || 1,
            current_page: pagination.current_page || 1,
            per_page: pagination.per_page || queryParams.per_page
          };
        }
        
        // Format 2: Direct object with birth_records
        if (response.data.birth_records) {
          return {
            birth_records: Array.isArray(response.data.birth_records) ? response.data.birth_records : [],
            total: response.data.total || 0,
            pages: response.data.pages || 1,
            current_page: response.data.current_page || 1,
            per_page: response.data.per_page || queryParams.per_page
          };
        }
        
        // Format 3: Direct array response
        if (Array.isArray(response.data)) {
          return {
            birth_records: response.data,
            total: response.data.length,
            pages: 1,
            current_page: 1,
            per_page: queryParams.per_page
          };
        }
        
        // Format 4: Direct object with data array
        if (Array.isArray(response.data.data)) {
          return {
            birth_records: response.data.data,
            total: response.data.total || response.data.data.length,
            pages: response.data.pages || 1,
            current_page: response.data.current_page || 1,
            per_page: response.data.per_page || queryParams.per_page
          };
        }
      }
      
      // If we get here, the response format is unexpected
      console.warn('Unexpected API response format:', response.data);
      return {
        birth_records: [],
        total: 0,
        pages: 1,
        current_page: 1,
        per_page: queryParams.per_page
      };
    } catch (error) {
      console.error('Error fetching birth records:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Rethrow with more context
      const errorMessage = error.response?.data?.message || 'Failed to fetch birth records';
      const apiError = new Error(errorMessage);
      apiError.response = error.response;
      throw apiError;
    }
  },
  
  getRecord: async (id) => {
    try {
      const response = await api.get(`/births/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching birth record ${id}:`, error);
      throw error;
    }
  },
  
  createRecord: async (recordData) => {
    try {
      const response = await api.post('/births', recordData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating birth record:', error);
      throw error;
    }
  },
  
  updateRecord: async (id, recordData) => {
    try {
      const response = await api.put(`/births/${id}`, recordData, {
        withCredentials: true
      });
      
      // Handle the response format
      if (response.data && response.data.success) {
        return response.data;
      }
      
      // If the response doesn't have the expected format, throw an error
      throw new Error('Unexpected response format from server');
      
    } catch (error) {
      console.error(`Error updating birth record ${id}:`, error);
      throw error.response?.data?.error || error.message || 'Failed to update birth record';
    }
  },
  
  deleteRecord: async (id) => {
    try {
      const response = await api.delete(`/births/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting birth record ${id}:`, error);
      throw error;
    }
  },
  
  approveRecord: async (id) => {
    try {
      const response = await api.patch(`/births/${id}/status`, { status: 'approved' }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving birth record ${id}:`, error);
      throw error;
    }
  },
  
  rejectRecord: async (id, reason = '') => {
    try {
      const response = await api.patch(`/births/${id}/status`, { 
        status: 'rejected',
        rejection_reason: reason 
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting birth record ${id}:`, error);
      throw error;
    }
  },
};

// Death Records API
export const deathRecordsAPI = {
  getRecords: async (params = {}) => {
    const response = await api.get('/deaths', { params });
    return response.data;
  },
  
  getRecord: async (id) => {
    const response = await api.get(`/deaths/${id}`);
    return response.data;
  },
  
  createRecord: async (recordData) => {
    const response = await api.post('/deaths', recordData);
    return response.data;
  },
  
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/deaths/${id}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (id) => {
    const response = await api.delete(`/deaths/${id}`);
    return response.data;
  },
  
  approveRecord: async (id) => {
    try {
      const response = await api.put(`/deaths/${id}/status`, { status: 'approved' }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving death record ${id}:`, error);
      throw error;
    }
  },
  
  rejectRecord: async (id, reason = '') => {
    try {
      const response = await api.put(`/deaths/${id}/status`, { 
        status: 'rejected',
        rejection_reason: reason 
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting death record ${id}:`, error);
      throw error;
    }
  },
};

// Marriage Records API
export const marriageRecordsAPI = {
  getRecords: async (params = {}) => {
    const response = await api.get('/marriages', { params });
    return response.data;
  },
  
  getRecord: async (id) => {
    const response = await api.get(`/marriages/${id}`);
    return response.data;
  },
  
  createRecord: async (recordData) => {
    const response = await api.post('/marriages', recordData);
    return response.data;
  },
  
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/marriages/${id}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (id) => {
    const response = await api.delete(`/marriages/${id}`);
    return response.data;
  },
  
  approveRecord: async (id) => {
    try {
      const response = await api.put(`/marriages/${id}/status`, { status: 'approved' }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving marriage record ${id}:`, error);
      throw error;
    }
  },
  
  rejectRecord: async (id, reason = '') => {
    try {
      const response = await api.put(`/marriages/${id}/status`, { 
        status: 'rejected',
        rejection_reason: reason 
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting marriage record ${id}:`, error);
      throw error;
    }
  },
};

// Divorce Records API
export const divorceRecordsAPI = {
  getRecords: async (params = {}) => {
    const response = await api.get('/divorces', { params });
    return response.data;
  },
  
  getRecord: async (id) => {
    const response = await api.get(`/divorces/${id}`);
    return response.data;
  },
  
  createRecord: async (recordData) => {
    const response = await api.post('/divorces', recordData);
    return response.data;
  },
  
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/divorces/${id}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (id) => {
    const response = await api.delete(`/divorces/${id}`);
    return response.data;
  },
  
  approveRecord: async (id) => {
    try {
      const response = await api.put(`/divorces/${id}/status`, { status: 'approved' }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving divorce record ${id}:`, error);
      throw error;
    }
  },
  
  rejectRecord: async (id, reason = '') => {
    try {
      const response = await api.put(`/divorces/${id}/status`, { 
        status: 'rejected',
        rejection_reason: reason 
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting divorce record ${id}:`, error);
      throw error;
    }
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },
  
  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },
  
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  
  submitReport: async (id) => {
    const response = await api.post(`/reports/${id}/submit`);
    return response.data;
  },
  
  reviewReport: async (id, reviewData) => {
    const response = await api.post(`/reports/${id}/review`, reviewData);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },
};

// Audit Logs API
export const auditLogsAPI = {
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
  
  getRecordHistory: async (recordType, recordId) => {
    const response = await api.get(`/audit-logs/record/${recordType}/${recordId}`);
    return response.data;
  },
  
  getUserHistory: async (userId, params = {}) => {
    const response = await api.get(`/audit-logs/user/${userId}`, { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/audit-logs/stats');
    return response.data;
  },
};

export default api;

