import axios from "axios";
import API_CONFIG from "@/config/api";

const axiosAdmin = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Tự động gắn token admin vào header
axiosAdmin.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Trả về dữ liệu body của response
axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default axiosAdmin;
