import React, { useEffect, useState } from "react";
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { getMyNotifications, markNotificationAsRead } from "../../services/notificationService";

const typeIcons = {
  report_reviewed: FiAlertTriangle,
  order_status_updated: FiInfo,
  appointment_confirmed: FiCheckCircle,
  default: FiInfo,
};

const typeColors = {
  report_reviewed: "text-yellow-600 bg-yellow-50",
  order_status_updated: "text-blue-600 bg-blue-50",
  appointment_confirmed: "text-green-600 bg-green-50",
  default: "text-gray-600 bg-gray-50",
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FiBell className="text-blue-600" size={24} /> Mes notifications
      </h2>
      {loading && notifications.length === 0 ? (
        <div className="text-center py-8">Chargement...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Aucune notification</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || typeIcons.default;
            const colorClass = typeColors[notif.type] || typeColors.default;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                className={`p-4 rounded-xl border border-gray-100 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notif.is_read ? "bg-blue-50/30" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${!notif.is_read ? "text-gray-900" : "text-gray-700"}`}>{notif.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
