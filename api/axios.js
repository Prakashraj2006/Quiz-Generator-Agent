import axios from 'axios';

// Create Axios instance pointing to backend server
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to automatically attach authorization headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Attempt to get user JWT from localStorage
    const token = localStorage.getItem('token') || 'mock-user-65d1a1b2c3d4e5f6a7b8c9d0';
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error management
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error formats for frontend display
    const customError = {
      message: 'An unexpected connection error occurred.',
      errors: [],
      status: error.response ? error.response.status : 500
    };

    if (error.response && error.response.data) {
      customError.message = error.response.data.message || customError.message;
      customError.errors = error.response.data.errors || [];
    } else if (error.message) {
      customError.message = error.message;
    }

    return Promise.reject(customError);
  }
);

export default axiosInstance;
