import React, { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import { initSocket } from "../../api/socket";
import NotificationList from "../../components/uiComponents/NotificationList";
import { useOutletContext } from "react-router-dom";

export default function NotificationsPro() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  
  const { resetBadge } = useOutletContext() || {};

  const fetchNotifications = useCallback(async (cursor = null) => {
    try {
      setLoading(true);
      const data = await getMyNotifications(cursor, 50);
      const newNotifs = Array.isArray(data) ? data : [];
      
      if (cursor) {
        setNotifications((prev) => {
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
    <NotificationList 
      title="Notifications Professionnelles"
      notifications={notifications}
      loading={loading && notifications.length === 0}
      onMarkAsRead={handleMarkAsRead}
      userRole="professional"
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  );
}
