import { useState, useEffect, useCallback } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import {
  RiDashboardLine,
  RiUserLine,
  RiBriefcaseLine,
  RiStoreLine,
  RiSettings4Line,
  RiMenuLine,
  RiSearchLine,
  RiNotification3Line,
  RiLogoutBoxRLine,
  RiCarLine,
  RiMessage3Line,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiFilePaper2Line,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import {
  getNotificationBadges,
  markNotificationsReadByType,
} from "../../services/notificationService";
import { initSocket } from "../../api/socket";
import siyanatiLogo from "../../assets/img/siyanati-logo-vertical-withoutbg.png";

// ─── Badge key mapping: notification types that map to sidebar items ─────────
// Each navItem can have a `badgeKey` which is a notification type string.
// The badge count is derived from unread notifications of that type.
const navItems = [
  { label: "Tableau de bord", icon: RiDashboardLine, path: "/admin" },
  {
    label: "Plans d'abonnement",
    icon: RiFilePaper2Line,
    path: "/admin/subscription-plans",
  },
  {
    label: "Abonnements",
    icon: RiMoneyDollarCircleLine,
    path: "/admin/subscriptions",
  },
  { label: "Clients", icon: RiUserLine, path: "/admin/clients" },
  {
    label: "Professionnels",
    icon: RiBriefcaseLine,
    path: "/admin/professionals",
    badgeKey: "new_professional_registration",
  },
  {
    label: "Magasins",
    icon: RiStoreLine,
    path: "/admin/stores",
    badgeKey: "new_store_registration",
  },
  { label: "Pièces", icon: RiSettings4Line, path: "/admin/parts" },
  { label: "Rapports", icon: RiFileTextLine, path: "/admin/reports" },
  {
    label: "Notifications",
    icon: RiNotification3Line,
    path: "/admin/notifications",
    badgeKey: "all_notifications",
  },
  { label: "Messages", icon: RiMessage3Line, path: "/admin/chat" },
];

// ─── Badge UI component ─────────────────────────────────────────────────────
function BadgeCount({ count }) {
  if (!count || count <= 0) return null;
  const display = count >= 10 ? "+9" : String(count);
  return (
    <span className="ml-auto min-w-[20px] h-5 px-1 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm shadow-red-500/30 animate-badge-in">
      {display}
    </span>
  );
}

// ─── Collapsed sidebar badge dot ─────────────────────────────────────────────
function BadgeDot({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-white shadow-sm" />
  );
}

export default function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  // ── Badge counts state ──────────────────────────────────────────────────
  const [badgeCounts, setBadgeCounts] = useState({});

  const adminName = user?.email || "Admin";
  const initials = adminName
    .split("@")[0]
    .split(".")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const shortName = "Admin";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // ── Fetch badge counts from backend ────────────────────────────────────
  const fetchBadges = useCallback(async () => {
    try {
      const data = await getNotificationBadges();
      setBadgeCounts(data || {});
    } catch (err) {
      console.error("Failed to fetch badge counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchBadges();

    // Listen for real-time notifications via socket
    const socket = initSocket();

    const handleNewNotification = (newNotif) => {
      setBadgeCounts((prev) => {
        const type = newNotif.type;
        const updated = { ...prev };
        updated[type] = (updated[type] || 0) + 1;
        updated["all_notifications"] = (updated["all_notifications"] || 0) + 1;
        return updated;
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [fetchBadges]);

  // ── Reset badge for a specific key (called by child pages via Outlet context) ──
  const resetBadge = useCallback(async (badgeKey) => {
    // Instantly clear from UI
    setBadgeCounts((prev) => {
      const updated = { ...prev };
      const removedCount = updated[badgeKey] || 0;
      updated[badgeKey] = 0;
      // Also decrement the total
      if (badgeKey !== "all_notifications") {
        updated["all_notifications"] = Math.max(
          0,
          (updated["all_notifications"] || 0) - removedCount,
        );
      }
      return updated;
    });

    // Mark as read on backend
    try {
      if (badgeKey === "all_notifications") {
        // Mark ALL unread notifications as read
        const { markNotificationAsRead } =
          await import("../../services/notificationService");
        await markNotificationAsRead("all");
        setBadgeCounts({});
      } else {
        await markNotificationsReadByType(badgeKey);
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  // ── Helper to get badge count for a nav item ──────────────────────────
  const getBadgeForItem = (item) => {
    if (!item.badgeKey) return 0;
    return badgeCounts[item.badgeKey] || 0;
  };

  // ── Total unread for top bar notification bell ─────────────────────────
  const totalUnread = badgeCounts["all_notifications"] || 0;

  return (
    <div
      className="flex h-screen bg-[#f5f7fa] text-[#1f1f1f] overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Badge animation keyframes */}
      <style>{`
        @keyframes badge-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-badge-in {
          animation: badge-in 0.3s ease-out forwards;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0 flex flex-col bg-white border-r border-[#e9effd]`}>
        {/* Logo */}
        <div className="flex  items-center gap-3 px-3 py-4 border-b border-[#e9effd]">
          <img className="w-1/2 " src={siyanatiLogo} alt="" />

          {sidebarOpen && (
            <div>
              <p className="text-xs text-[#6b7280]">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = getBadgeForItem(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative no-underline
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#2563eb]/10 to-[#2563eb]/5 text-[#2563eb]"
                      : "text-[#6b7280] hover:text-[#1f1f1f] hover:bg-[#e9effd]/50"
                  }`
                }>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563eb] rounded-r-full" />
                    )}
                    <div className="relative flex-shrink-0">
                      <Icon className="text-lg" />
                      {!sidebarOpen && <BadgeDot count={badgeCount} />}
                    </div>
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <BadgeCount count={badgeCount} />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile card */}
        <div className="p-3 border-t border-[#e9effd]">
          <div
            className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-[#e9effd]/50 ${sidebarOpen ? "" : "justify-center"}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb] to-[#0b3c5d] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[#1f1f1f]">
                  Admin
                </p>
                <p className="text-xs text-[#6b7280] truncate">{adminName}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="text-[#6b7280] hover:text-[#ef4444] transition-colors"
                title="Logout">
                <RiLogoutBoxRLine className="text-base" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#e9effd] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#6b7280] hover:text-[#1f1f1f] transition-colors p-1">
            <RiMenuLine className="text-xl" />
          </button>

          <div className="flex-1 max-w-md relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-base" />
            <input
              type="text"
              placeholder="Rechercher utilisateurs, commandes, magasins..."
              className="w-full bg-[#f5f7fa] border border-[#e9effd] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1f1f1f] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]/50 focus:bg-white transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="relative w-10 h-10 rounded-xl bg-[#f5f7fa] border border-[#e9effd] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] hover:border-[#2563eb]/30 transition-all">
              <RiNotification3Line className="text-lg" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm animate-badge-in">
                  {totalUnread >= 10 ? "+9" : totalUnread}
                </span>
              )}
            </button>

            <button className="w-10 h-10 rounded-xl bg-[#f5f7fa] border border-[#e9effd] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] hover:border-[#2563eb]/30 transition-all">
              <RiSettings4Line className="text-lg" />
            </button>

            <button className="flex items-center gap-2.5 ml-2 bg-[#f5f7fa] border border-[#e9effd] rounded-xl px-3 py-2 hover:border-[#2563eb]/30 transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563eb] to-[#0b3c5d] flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-[#1f1f1f]">
                {shortName}
              </span>
            </button>
          </div>
        </header>

        {/* ── Page Content via Outlet ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ resetBadge }} />
        </main>
      </div>
    </div>
  );
}
