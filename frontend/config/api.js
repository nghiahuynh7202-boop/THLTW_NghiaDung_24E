const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const host =
      window.location.hostname === "localhost"
        ? "127.0.0.1"
        : window.location.hostname;
    return `http://${host}:8000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"; 
};

const getRootUrl = () => {
  if (typeof window !== "undefined") {
    const host =
      window.location.hostname === "localhost"
        ? "127.0.0.1"
        : window.location.hostname;
    return `http://${host}:8000`;
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
};

// Cấu hình tài khoản ngân hàng chuyển khoản tự động SePay / VietQR
export const BANK_CONFIG = {
  BANK_NAME: process.env.NEXT_PUBLIC_BANK_NAME || "ACB (Ngân hàng Á Châu)",
  BANK_CODE: process.env.NEXT_PUBLIC_BANK_CODE || "ACB",
  ACCOUNT_NUMBER: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "18900291",
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
