import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth_user');
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
        console.error('Error parsing auth_user from localStorage', e);
    }
  }
  return config;
}); 
   
export default http;
