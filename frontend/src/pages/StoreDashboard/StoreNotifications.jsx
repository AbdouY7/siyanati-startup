import { RiNotification3Line } from "react-icons/ri";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiBell } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

const typeIcons = {
  report_reviewed: FiAlertTriangle,
  order_status_updated: FiInfo,
  appointment_confirmed: FiCheckCircle,
  default: FiBell,
};

const typeColors = {
  report_reviewed: { bg: "#fef9c318", text: "#ca8a04" },
  order_status_updated: { bg: "#eff6ff18", text: "#2563eb" },
  appointment_confirmed: { bg: "#f0fdf418", text: "#16a34a" },
  default: { bg: "#f3f4f618", text: "#6b7280" },
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

export default function StoreNotifications() {
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
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Centre de notifications pour les magasins.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="border-b border-[#e9effd] px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiNotification3Line className="text-[#2563eb]" /> Activité récente
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FiBell className="text-3xl text-[#cbd5e1]" />
            <p className="text-sm text-[#9ca3af]">
              Aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e9effd]">
            {notifications.map((item) => {
              const type = item.type || "default";
              const Icon = typeIcons[type] || typeIcons.default;
              const colors = typeColors[type] || typeColors.default;
              const isUnread = !item.is_read;

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 px-6 py-5 transition-colors ${isUnread ? "bg-[#2563eb]/5" : "bg-white"}`}>
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.bg, color: colors.text }}>
                    <Icon className="text-xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1f1f1f]">
                          {item.title || "Notification"}
                        </p>
                        <p className="mt-1 text-sm text-[#6b7280] break-words">
                          {item.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-[#9ca3af]">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>

                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="mt-2 text-xs font-medium text-[#2563eb] hover:underline">
                        Marquer comme lu
                      </button>
                    )}
                  </div>

                  {isUnread && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
