const prisma = require("../prisma/client");

// Get all notifications for the logged-in user
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark a specific notification as read, or all if id is 'all'
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === "all") {
      await prisma.notification.updateMany({
        where: { user_id: req.user.id, is_read: false },
        data: { is_read: true },
      });
    } else {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification || notification.user_id !== req.user.id) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      await prisma.notification.update({
        where: { id },
        data: { is_read: true },
      });
    }

    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
};
