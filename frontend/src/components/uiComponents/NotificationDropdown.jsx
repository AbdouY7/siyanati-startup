import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiCheck } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";
import { initSocket } from "../../api/socket";
import useAuthStore from "../../store/authStore";
import {
  typeIcons,
  typeColors,
  timeAgo,
  getNotificationLink,
} from "../../utils/notificationDisplay";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications(null, 20); // Only need a few for dropdown
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silently fail - user may not be logged in
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when dropdown opens if empty, or just initially to get badge count
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Socket logic
  useEffect(() => {
    if (!user) return;
    
    const socket = initSocket();
    
    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
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
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      const socket = initSocket();
      socket.emit("mark_notification_read", { id });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      const socket = initSocket();
      socket.emit("mark_notification_read", { id: "all" });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleRowClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    const link = getNotificationLink(notif, userRole);
    if (link && link !== "#") {
      navigate(link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span 
            aria-live="polite"
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors focus:outline-none focus:underline"
              >
                <FiCheck size={12} /> Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto" role="list">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => {
                const Icon = typeIcons[notif.type] || typeIcons.default;
                const colorClass = typeColors[notif.type] || typeColors.default;

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleRowClick(notif)}
                    role="listitem"
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 flex gap-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 ${
                      !notif.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!notif.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span 
                            role="button" 
                            tabIndex={0} 
                            onClick={(e) => handleMarkAsRead(notif.id, e)} 
                            onKeyDown={(e) => { if(e.key === 'Enter') handleMarkAsRead(notif.id, e); }}
                            className="w-2 h-2 rounded-full bg-blue-500 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Marquer comme lu"
                            title="Marquer comme lu"
                          ></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
