import axios from 'axios';

// API Gateway config
const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // In browser context:
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('greentech_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
