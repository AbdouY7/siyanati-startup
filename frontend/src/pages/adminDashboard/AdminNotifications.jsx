import { useEffect, useState } from "react";
import { FiBell, FiCheckCircle, FiFileText, FiInfo } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import { initSocket } from "../../api/socket";
import { useOutletContext } from "react-router-dom";

const typeIcons = {
  new_message: FiFileText,
  report_reviewed: FiInfo,
  new_store_registration: FiCheckCircle,
  new_professional_registration: FiCheckCircle,
  default: FiBell,
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMins = Math.floor((now - date) / 60000);
  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Badge: clear all_notifications badge when admin views this page
  const { resetBadge } = useOutletContext() || {};

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

    // Clear the notifications badge when admin views this page
    if (resetBadge) resetBadge("all_notifications");

    const socket = initSocket();

    socket.on("new_notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Notifications</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Alertes admin pour les mises a jour importantes.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="border-b border-[#e9effd] px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <FiBell className="text-[#2563eb]" /> Activite recente
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <FiCheckCircle className="text-3xl text-[#cbd5e1]" />
            <p className="text-sm text-[#9ca3af]">Aucune notification.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e9effd]">
            {notifications.map((item) => {
              const Icon = typeIcons[item.type] || typeIcons.default;
              const isUnread = !item.is_read;

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 px-6 py-5 ${isUnread ? "bg-[#2563eb]/5" : "bg-white"}`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                    <Icon className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1f1f1f]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          {item.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-[#9ca3af]">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    {isUnread && (
                      <button
                        type="button"
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
