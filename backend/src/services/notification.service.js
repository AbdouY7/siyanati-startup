const prisma = require("../prisma/client");
const { getIO, emitWorkflowUpdate } = require("../socket");

/**
 * Send a notification to a single user and emit it via Socket.IO.
 */
const notifyUser = async (userId, type, title, message, referenceId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
        reference_id: referenceId,
      },
    });

    try {
      const io = getIO();
      io.to(`user_${userId}`).emit("new_notification", notification);
    } catch (err) {
      console.error("Socket not initialized yet or error emitting:", err.message);
    }

    return notification;
  } catch (error) {
    console.error("Failed to notify user:", error);
  }
};

/**
 * Send a notification to all active admin users (fan-out).
 * Each admin gets their own row so read-state is independent.
 */
const notifyAdmins = async (type, title, message, referenceId = null) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin", is_active: true },
      select: { id: true },
    });

    if (admins.length === 0) return;

    const data = admins.map(admin => ({
      user_id: admin.id,
      type,
      title,
      message,
      reference_id: referenceId,
    }));

    await prisma.notification.createMany({ data });

    try {
      const io = getIO();
      // Emit individually to each admin's room so every admin socket gets the event
      const payload = {
        type,
        title,
        message,
        reference_id: referenceId,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      admins.forEach(admin => {
        io.to(`user_${admin.id}`).emit("new_notification", { ...payload, user_id: admin.id });
      });

      emitWorkflowUpdate({
        entityType: "notification",
        entityId: null,
        action: "created",
        newState: { type, title, message },
        affectedUsers: admins.map(a => a.id),
        broadcastToRoles: ["admin"],
      });
    } catch (err) {
      console.error("Socket not initialized yet or error emitting:", err.message);
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
};

module.exports = {
  notifyUser,
  notifyAdmins,
};
