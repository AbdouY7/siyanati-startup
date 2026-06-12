const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma/client");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
      credentials: true,
    },
  });

  // Authentication middleware for socket.io
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      
      // Optionally verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub }
      });

      if (!user) {
         return next(new Error("User not found"));
      }

      // Join a room based on the user's role and id
      socket.join(`user_${user.id}`);
      if (user.role === 'admin') {
        socket.join('admin_room');
      }

      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.sub})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
