import axios from 'axios';

/**
 * Global axios instance with pre-configured base URL and headers.
 */
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for standardized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return error data or the error itself
    const errorData = error.response ? error.response.data : error;
    return Promise.reject(errorData);
  }
);

export default axiosInstance;
