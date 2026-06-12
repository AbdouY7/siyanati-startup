import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Extract base origin (e.g., http://localhost:3001 from http://localhost:3001/api)
const baseURL = apiURL.replace(/\/api\/?$/, '');

let socket;

export const initSocket = () => {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io(baseURL, {
    auth: {
      token
    },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
