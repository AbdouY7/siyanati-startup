import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiCalendarLine,
  RiUserLine,
  RiTimeLine,
  RiMessage3Line,
  RiStarLine,
  RiMenuLine,
  RiSearchLine,
  RiNotification3Line,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiHome5Line,
  RiCarLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";

const navItems = [
  { label: "Tableau de bord", icon: RiDashboardLine, path: "/pro" },
  { label: "Mon Abonnement", icon: RiMoneyDollarCircleLine, path: "/pro/subscription" },
  { label: "Rendez-vous", icon: RiCalendarLine, path: "/pro/appointments" },
  { label: "Planification", icon: RiTimeLine, path: "/pro/schedule" },
  { label: "Avis", icon: RiStarLine, path: "/pro/reviews" },
  { label: "Profil", icon: RiUserLine, path: "/pro/profile" },
  {
    label: "Notifications",
    icon: RiNotification3Line,
    path: "/pro/notifications",
    badge: 2,
  },
  { label: "Messages", icon: RiMessage3Line, path: "/pro/messages", badge: 3 },
  { label: "Diagnostic", icon: RiCarLine, path: "/pro/diagnostic" },
];

export default function HomePro() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  // Extract professional data from the authenticated user
  const professionalName =
    user?.professional_profile?.full_name || "Professional";
  const specialtyType =
    user?.professional_profile?.specialty_type || "Specialist";
  const initials = professionalName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const shortName =
    professionalName.split(" ")[0] +
    (professionalName.split(" ")[1]
      ? ` ${professionalName.split(" ")[1][0]}.`
      : "");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div
      className="flex h-screen bg-[#f5f7fa] text-[#1f1f1f] overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0 flex flex-col bg-white border-r border-[#e9effd]`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#e9effd]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#0b3c5d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#2563eb]/20">
            <RiCarLine className="text-white text-xl" />
            {/* // the logo of the website */}
          </div>
          {/* //the name of the website */}
          {sidebarOpen && (
            <div>
              <p
                className="font-bold text-base tracking-tight leading-none"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SIYANATI
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative no-underline
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#2563eb]/10 to-[#2563eb]/5 text-[#2563eb]"
                      : "text-[#6b7280] hover:text-[#1f1f1f] hover:bg-[#e9effd]/50"
                  }`
                }>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563eb] rounded-r-full" />
                )}
                <Icon className="text-lg flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-[#2563eb] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
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
                  {professionalName}
                </p>
                <p className="text-xs text-[#6b7280] truncate">
                  {specialtyType}
                </p>
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
              placeholder="Search appointments, reviews..."
              className="w-full bg-[#f5f7fa] border border-[#e9effd] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1f1f1f] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]/50 focus:bg-white transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate("/pro/notifications")}
              className="relative w-10 h-10 rounded-xl bg-[#f5f7fa] border border-[#e9effd] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] hover:border-[#2563eb]/30 transition-all">
              <RiNotification3Line className="text-lg" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#2563eb] rounded-full" />
            </button>

            <button
              onClick={() => navigate("/pro/profile")}
              className="w-10 h-10 rounded-xl bg-[#f5f7fa] border border-[#e9effd] flex items-center justify-center text-[#6b7280] hover:text-[#1f1f1f] hover:border-[#2563eb]/30 transition-all">
              <RiSettings4Line className="text-lg" />
            </button>

            <button
              onClick={() => navigate("/pro/profile")}
              className="flex items-center gap-2.5 ml-2 bg-[#f5f7fa] border border-[#e9effd] rounded-xl px-3 py-2 hover:border-[#2563eb]/30 transition-all">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
