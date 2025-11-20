import axios from "axios";

const axiosAuth = axios.create({
  baseURL: "/api",
});

// Attach token automatically
axiosAuth.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth_user");
    const user = raw ? JSON.parse(raw) : null;

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (err) {
    console.error("Failed to parse auth_user:", err);
  }

  return config;
});

export default axiosAuth;
