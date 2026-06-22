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

// Get badge counts grouped by type
const getBadgeCounts = async (req, res, next) => {
  try {
    const unreadCounts = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        user_id: req.user.id,
        is_read: false,
      },
      _count: {
        id: true,
      },
    });

    // Format into a simple object: { "new_store_registration": 2, "new_professional_registration": 5 }
    const badges = {};
    let totalUnread = 0;
    
    unreadCounts.forEach(item => {
      badges[item.type] = item._count.id;
      totalUnread += item._count.id;
    });

    badges["all_notifications"] = totalUnread; // Useful for generic notifications badge

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read by type
const markAsReadByType = async (req, res, next) => {
  try {
    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    await prisma.notification.updateMany({
      where: {
        user_id: req.user.id,
        type: type,
        is_read: false,
      },
      data: { is_read: true },
    });

    res.json({ success: true, message: `Notifications of type ${type} marked as read` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  getBadgeCounts,
  markAsReadByType,
};
