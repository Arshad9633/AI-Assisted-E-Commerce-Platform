import axios from 'axios';

function normalizeBase(base) {
  if (!base) return '';
  // Remove trailing slash for consistency
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

// Prefer VITE_API_BASE (proxy-friendly), then VITE_API_BASE_URL, then /api
const ENV_BASE =
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_BASE_URL ??
  '/api';

const baseURL = normalizeBase(ENV_BASE);

const http = axios.create({
  baseURL, // e.g. "/api" or "http://localhost:8000"
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth_user');
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // Only log in dev
      if (import.meta.env.DEV) {
        console.warn('auth_user parse failed:', e);
      }
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize network errors so the UI can show a friendly message
    if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
      err.response = err.response ?? {
        status: 0,
        data: { message: 'Network error. Please try again.' },
      };
    }
    return Promise.reject(err);
  }
);

export default http;
