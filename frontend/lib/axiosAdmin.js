import axios from "axios";
import API_CONFIG from "@/config/api";

/**
 * Axios riêng cho trang Quản trị Admin
 * Phong cách sinh viên: Ngắn gọn, tự động gắn token riêng của Admin
 */
const axiosAdmin = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Tự động gắn token riêng của admin vào header mỗi request
axiosAdmin.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Chỉ dùng admin_token riêng biệt, tách biệt 100% với user khách hàng
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Trả về dữ liệu body của response
axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu token admin hết hạn hoặc chưa đăng nhập thì tự chuyển về trang /admin/login
    if (typeof window !== "undefined" && error.response?.status === 401) {
      if (!window.location.pathname.includes("/admin/login")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAdmin;
