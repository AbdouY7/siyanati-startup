import { create } from "zustand";
import axios from "axios";
import { decodeJwt } from "../utils/jwtUtils";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isCheckingAuth: true, // true by default to check session on initial load

  setAuth: async (userParam, token, refreshTokenParam) => {
    // IMMEDIATELY save tokens so they survive page navigations
    if (refreshTokenParam) {
      localStorage.setItem("refreshToken", refreshTokenParam);
    }

    // Set accessToken in Zustand right away so axios interceptor can use it
    set((state) => ({
      user: userParam || state.user,
      accessToken: token,
      isAuthenticated: true,
    }));

    // Then fetch user profile in the background if not provided
    if (!userParam && token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.sub) {
        try {
          const userRes = await axios.get(`${baseURL}/users/${decoded.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Update only the user field, keep the rest
          set({ user: userRes.data.user });
        } catch (e) {
          console.error("Failed to fetch user profile during setAuth", e);
        }
      }
    }
  },

  clearAuth: () => {
    localStorage.removeItem("refreshToken");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        {
          withCredentials: true,
        },
      );

      const accessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;
      let userProfile = response.data.user;

      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      if (!userProfile && accessToken) {
        const decoded = decodeJwt(accessToken);
        if (decoded && decoded.sub) {
          try {
            const userRes = await axios.get(`${baseURL}/users/${decoded.sub}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            userProfile = userRes.data.user;
          } catch (e) {
            console.error("Failed to fetch user profile during checkAuth", e);
          }
        }
      }

      set({
        user: userProfile,
        accessToken: accessToken,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));

export default useAuthStore;
