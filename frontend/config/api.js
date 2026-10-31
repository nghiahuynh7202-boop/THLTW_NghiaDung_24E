const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:8000/api`;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
};

const getRootUrl = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:8000`;
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
};

// Cấu hình tài khoản ngân hàng chuyển khoản tự động SePay / VietQR
export const BANK_CONFIG = {
    BANK_NAME: process.env.NEXT_PUBLIC_BANK_NAME || "ACB",
    BANK_ACCOUNT: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "18900291",
    ACCOUNT_NAME: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "DAO DUY DUNG",
};

const API_CONFIG = {
    get BASE_URL() {
        return getBaseUrl();
    },
    get ROOT_URL() {
        return getRootUrl();
    },
    TIMEOUT: 30000,
    HEADERS: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
};

export default API_CONFIG;
