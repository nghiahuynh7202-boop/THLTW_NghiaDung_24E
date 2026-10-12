import axios from "axios";
import API_CONFIG from "@/config/api";
const axiosAdmin = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        Accept: "application/json",
    },
});
// Helper tự động lọc bỏ các đoạn cảnh báo HTML của PHP (nếu có) trước chuỗi JSON
function cleanJsonResponse(data) {
    if (typeof data === "string") {
        const trimmed = data.trim();
        const jsonStartIndex = trimmed.indexOf("{");
        const jsonArrayStartIndex = trimmed.indexOf("[");
        const firstJsonIndex = jsonStartIndex !== -1 && jsonArrayStartIndex !== -1
            ? Math.min(jsonStartIndex, jsonArrayStartIndex)
            : Math.max(jsonStartIndex, jsonArrayStartIndex);
        if (firstJsonIndex !== -1) {
            try {
                const jsonPart = trimmed.substring(firstJsonIndex);
                return JSON.parse(jsonPart);
            }
            catch {
                // Giữ nguyên nếu không parse được
            }
        }
    }
    return data;
}
// Request interceptor - đồng bộ baseURL và gắn token
axiosAdmin.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname || "127.0.0.1";
        config.baseURL = `http://${hostname}:8000/api`;
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // Nếu là FormData, để Axios tự động gán Content-Type và boundary phù hợp
    if (config.data instanceof FormData && config.headers) {
        delete config.headers["Content-Type"];
        if (typeof config.headers.delete === "function") {
            config.headers.delete("Content-Type");
        }
    }
    return config;
}, (error) => Promise.reject(error));
// Response interceptor: unwrap và tự động lọc HTML lỗi PHP
axiosAdmin.interceptors.response.use((response) => {
    return cleanJsonResponse(response.data);
}, (error) => Promise.reject(error));
export default axiosAdmin;
