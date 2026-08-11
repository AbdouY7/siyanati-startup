import { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";
import { initSocket } from "../../api/socket";
import { useOutletContext } from "react-router-dom";
import NotificationList from "../../components/uiComponents/NotificationList";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Badge: clear all_notifications badge when admin views this page
  const { resetBadge } = useOutletContext() || {};

  const fetchNotifications = useCallback(async (cursor = null) => {
    try {
      setLoading(true);
      const data = await getMyNotifications(cursor, 50);
      const newNotifs = Array.isArray(data) ? data : [];
      
      if (cursor) {
        setNotifications((prev) => {
          // Prevent duplicates if socket already pushed it
          const existingIds = new Set(prev.map(n => n.id));
          const filtered = newNotifs.filter(n => !existingIds.has(n.id));
          return [...prev, ...filtered];
        });
      } else {
        setNotifications(newNotifs);
      }
      
      setHasMore(newNotifs.length === 50);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (resetBadge) resetBadge("all_notifications");

    const socket = initSocket();

    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };
    
    const handleNotificationRead = (readData) => {
      if (readData.id === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === readData.id ? { ...n, is_read: true } : n))
        );
      }
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification_read", handleNotificationRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_read", handleNotificationRead);
    };
  }, [fetchNotifications, resetBadge]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
      );
      // Emit to sync other tabs
      const socket = initSocket();
      socket.emit("mark_notification_read", { id });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleLoadMore = () => {
    if (notifications.length > 0 && !loading) {
      const lastCursor = notifications[notifications.length - 1].id;
      fetchNotifications(lastCursor);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e9effd] m-6 p-4">
      <NotificationList 
        title="Alertes Administrateur"
        notifications={notifications}
        loading={loading && notifications.length === 0}
        onMarkAsRead={handleMarkAsRead}
        userRole="admin"
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
