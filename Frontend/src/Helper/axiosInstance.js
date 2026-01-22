import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    withCredentials: true,
    // DO NOT set default Content-Type here - let each request set its own
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('session-auth-access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Only set Content-Type to JSON if it's NOT FormData
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        // If it IS FormData, browser will automatically set:
        // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
