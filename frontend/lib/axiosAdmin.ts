import axios from "axios";
import API_CONFIG from "@/config/api";

const axiosAdmin = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// -- Request interceptor - đọc token từ localStorage và đồng bộ hostname
axiosAdmin.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Đồng bộ baseURL theo hostname hiện tại (localhost hoặc 127.0.0.1) tránh lỗi CORS chéo port
      config.baseURL = `http://${window.location.hostname}:8000/api`;

      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);


axiosAdmin.interceptors.response.use(
  (response) => response.data, // ✅ unwrap đơn giản
  (error) => Promise.reject(error)
);

export default axiosAdmin;
