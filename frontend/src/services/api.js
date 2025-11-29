import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getStats: () => api.get('/stats'),
  getMinhasDemandas: () => api.get('/demandas/minhas'),
};

export const demandasAPI = {
  getAll: () => api.get('/demandas'),
  getById: (id) => api.get(`/demandas/${id}`),
  create: (data) => api.post('/demandas', data),
  updateStatus: (id, status) => api.patch(`/demandas/${id}/status`, { status }),
  solicitarRevisao: (id) => api.post(`/demandas/${id}/solicitar-revisao`),
};

export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export default api;