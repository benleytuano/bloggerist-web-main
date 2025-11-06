import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Replace with your API base URL
  timeout: 10000, // Timeout in milliseconds
});

// Request Interceptor: Attach JWT token from cookies to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); // Get the JWT token from cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle login responses to store JWT in cookies
apiClient.interceptors.response.use(
  (response) => response, // Pass through for successful responses
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Consider redirecting to login.");
      // Handle token expiry or unauthorized access here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
