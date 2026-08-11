import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import {
  typeIcons,
  typeColors,
  timeAgo,
  getNotificationLink,
} from "../../utils/notificationDisplay";

export default function NotificationList({
  title = "Notifications",
  notifications = [],
  loading = false,
  onMarkAsRead,
  userRole,
  backLink,
  hasMore = false,
  onLoadMore,
}) {
  const navigate = useNavigate();

  const handleRowClick = async (notif) => {
    if (!notif.is_read && onMarkAsRead) {
      await onMarkAsRead(notif.id);
    }
    const link = getNotificationLink(notif, userRole);
    if (link && link !== "#") {
      navigate(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-10 mb-10">
        {backLink && (
          <Link
            to={backLink}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm"
            aria-label="Retour"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Link>
        )}
        <h2 className="text-2xl font-bold flex items-center gap-4">
          <FiBell className="text-blue-600" size={24} /> {title}
        </h2>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="text-center py-8">Chargement...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Aucune notification</div>
      ) : (
        <div className="space-y-2" role="list">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || typeIcons.default;
            const colorClass = typeColors[notif.type] || typeColors.default;
            return (
              <button
                key={notif.id}
                onClick={() => handleRowClick(notif)}
                className={`w-full text-left p-4 rounded-xl border border-gray-100 flex gap-4 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 ${
                  !notif.is_read ? "bg-blue-50/30" : ""
                }`}
                role="listitem"
                aria-label={`Notification: ${notif.title}, ${notif.is_read ? 'Lue' : 'Non lue'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      !notif.is_read ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(notif.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Voir plus"}
          </button>
        </div>
      )}
    </div>
  );
}
