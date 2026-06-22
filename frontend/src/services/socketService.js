import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      if (this.socket.connected) return;
      this.socket.disconnect();
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    const serverUrl = apiUrl.replace("/api", "");

    this.socket = io(serverUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("[SocketService] Connected with ID:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketService] Disconnected. Reason:", reason);
    });

    this.socket.on("workflow_update", (data) => {
      console.log("[SocketService] Received workflow_update:", data);
      const callbacks = this.listeners.get("workflow_update") || [];
      callbacks.forEach((cb) => cb(data));
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const filtered = this.listeners.get(event).filter((cb) => cb !== callback);
      this.listeners.set(event, filtered);
    } else {
      this.listeners.delete(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;
