import axios from 'axios';

// API Gateway config
const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('greentech_token');
      if (token) {
        if (config.headers && typeof config.headers.set === 'function') {
           config.headers.set('Authorization', `Bearer ${token}`);
        } else {
           config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const failingUrl = error.config?.url;
      let detail = error.response?.data?.message;
      if (typeof detail !== 'string') detail = JSON.stringify(detail);
      
      alert(`Error 401 en ${failingUrl}\n\nDetalle del servidor: ${detail || 'Desconocido'}`);
      
      localStorage.removeItem('greentech_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
