import axios from "axios";
import API_CONFIG from "@/config/api";
const axiosClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONFIG.TIMEOUT,
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
axiosClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        config.baseURL = `http://${window.location.hostname || "127.0.0.1"}:8000/api`;
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
// Response interceptor: unwrap và tự động lọc HTML lỗi PHP
axiosClient.interceptors.response.use((response) => {
    return cleanJsonResponse(response.data);
}, (error) => Promise.reject(error));
export default axiosClient;
