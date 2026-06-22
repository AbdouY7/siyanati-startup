const prisma = require("../prisma/client");
const { getIO, emitWorkflowUpdate } = require("../socket");

const notifyAdmins = async (type, title, message) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin", is_active: true }
    });

    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type,
      title,
      message,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      });

      try {
        const io = getIO();
        io.to("admin_room").emit("new_notification", { type, title, message, created_at: new Date() });

        emitWorkflowUpdate({
          entityType: "notification",
          entityId: null,
          action: "created",
          newState: { type, title, message },
          affectedUsers: admins.map(a => a.id),
          broadcastToRoles: ["admin"]
        });
      } catch (err) {
        console.error("Socket not initialized yet or error emitting:", err);
      }
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
};

module.exports = {
  notifyAdmins
};
