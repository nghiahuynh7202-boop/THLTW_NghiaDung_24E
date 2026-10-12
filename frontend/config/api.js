const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:8000/api`;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
};
const API_CONFIG = {
    get BASE_URL() {
        return getBaseUrl();
    },
    TIMEOUT: 30000,
    HEADERS: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
};
export default API_CONFIG;
