import axios from "axios";
import API_CONFIG from "@/config/api";

const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

axiosClient.interceptors.request.use((config) => {
  // ✅ Kiểm tra typeof window trước khi dùng localStorage
  if (typeof window !== "undefined") {
    // Đảm bảo baseURL đồng bộ hostname
    config.baseURL = `http://${window.location.hostname}:8000/api`;

    // ✅ Use correct key from AuthContext
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ✅ Response interceptor unwrap data đơn giản
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default axiosClient;
