const prisma = require("../prisma/client");

// Get all notifications for the logged-in user with cursor-based pagination
const getMyNotifications = async (req, res, next) => {
  try {
    const { cursor, take } = req.query;
    const limit = take ? parseInt(take, 10) : 50;

    const query = {
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      take: limit,
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor itself
    }

    const notifications = await prisma.notification.findMany(query);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark a specific notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.notification.updateMany({
      where: { id, user_id: req.user.id },
      data: { is_read: true },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found or already read" });
    }

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true },
    });
    res.json({ success: true, message: "All notifications marked as read" });
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
    
    const { NotificationType } = require('@prisma/client');
    if (!Object.values(NotificationType).includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid notification type" });
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
  markAllAsRead,
  getBadgeCounts,
  markAsReadByType,
};
