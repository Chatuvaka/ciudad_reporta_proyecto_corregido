import axios from 'axios';

export function clearWorkerSession() {
  localStorage.removeItem('workerToken');
  localStorage.removeItem('workerName');
  localStorage.removeItem('workerEmail');
}

export function isWorkerTokenValid(token = localStorage.getItem('workerToken')) {
  if (!token || !token.includes('.')) return false;

  try {
    const [payload] = token.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const data = JSON.parse(atob(padded));

    return Boolean(data.exp && Date.now() < data.exp);
  } catch {
    return false;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('workerToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearWorkerSession();
    }

    return Promise.reject(error);
  }
);

export const crearReporte = (data) => api.post('/reportes', data);
export const obtenerReportes = () => api.get('/reportes');

export const loginTrabajador = (data) => api.post('/trabajadores/login', data);
export const obtenerReportesTrabajador = () => api.get('/trabajadores/reportes');
export const obtenerReporteTrabajadorPorId = (id) => api.get(`/trabajadores/reportes/${id}`);
export const tomarReporteTrabajador = (id) => api.patch(`/trabajadores/reportes/${id}/tomar`);
export const completarReporteTrabajador = (id, data = {}) => api.patch(`/trabajadores/reportes/${id}/completar`, data);
export const cancelarReporteTrabajador = (id, data = {}) => api.patch(`/trabajadores/reportes/${id}/cancelar`, data);

export default api;
