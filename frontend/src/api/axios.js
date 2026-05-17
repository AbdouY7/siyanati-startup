import axios from 'axios';
import useAuthStore from '../store/authStore';

// Determine base URL depending on environment
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Important: allows sending/receiving HttpOnly cookies
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if the refresh endpoint itself returns 401
      if (originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token 
        const response = await axiosInstance.post('/auth/refresh', { refreshToken: storedRefreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;

        // Update the Zustand store with the new token
        useAuthStore.getState().setAuth(user, accessToken, newRefreshToken);

        // Update the authorization header for the original failed request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state
        useAuthStore.getState().clearAuth();
        // Redirect to login (or handle within components via state)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
