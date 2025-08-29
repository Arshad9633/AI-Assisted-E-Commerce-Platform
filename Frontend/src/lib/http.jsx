import axios from "axios";

function normalizeBase(base) {
  if (!base) return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

const ENV_BASE =
  import.meta.env.VITE_API_BASE ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api";

const baseURL = normalizeBase(ENV_BASE);

const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 15000,
});

const STORAGE_KEY = "auth_user";

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      if (import.meta.env.DEV) console.warn("auth_user parse failed:", e);
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.message === "Network Error" || err.code === "ECONNABORTED") {
      err.response = err.response ?? {
        status: 0,
        data: { message: "Network error. Please try again." },
      };
    }
    if (err?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return Promise.reject(err);
  }
);

export default http;
