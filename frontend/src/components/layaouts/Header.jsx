import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMessageSquare,
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import siyanatiLogo from "../../assets/img/siyanati-vertical-logo.png";
import useAuthStore from "../../store/authStore";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import NotificationDropdown from "../uiComponents/NotificationDropdown";

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const isAuth = isAuthenticated && !!user;
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const drawerRef = useRef(null);

  const getDashboardPath = () => {
    if (!isAuth) return "/";
    switch (user?.role) {
      case "customer": return "/home-user";
      case "professional": return "/pro";
      case "store": return "/store";
      case "admin": return "/admin";
      default: return "/";
    }
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case "professional": return "/pro/profile";
      case "store": return "/store/profile";
      case "admin": return "/admin";
      default: return "/profile";
    }
  };

  const getChatPath = () => {
    switch (user?.role) {
      case "professional": return "/pro/chat";
      case "store": return "/store/chat";
      case "admin": return "/admin/chat";
      default: return "/profile/chat";
    }
  };

  const getNotificationsPath = () => {
    switch (user?.role) {
      case "professional": return "/pro/notifications";
      case "store": return "/store/notifications";
      case "admin": return "/admin/notifications";
      default: return "/profile/notifications";
    }
  };

  const menuItems = [
    { name: t("nav_home"), href: getDashboardPath() },
    { name: t("nav_catalogs"), href: "/catalogues" },
    { name: t("nav_stores"), href: "/magasins" },
    { name: t("nav_professionals"), href: "/professionnels" },
    { name: t("nav_diagnostic"), href: "/diagnostic" },
  ];

  const icons = [
    {
      name: "User",
      icon: <FiUser size={18} />,
      label: t("nav_profile"),
      link: getProfilePath(),
    },
    {
      name: "Message",
      icon: <FiMessageSquare size={18} />,
      label: t("nav_messages"),
      link: getChatPath(),
    },
    {
      name: "Notifications",
      icon: <FiBell size={18} />,
      label: t("nav_notifications"),
      link: getNotificationsPath(),
    },
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="w-full pt-4 px-4 sm:px-6 lg:px-8 fixed top-0 left-0 z-50 flex justify-center pointer-events-none">
        <header className="bg-primary-dark/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[64px] rounded-full shadow-xl border border-white/10 w-full max-w-7xl pointer-events-auto transition-all duration-300">
          {/* Logo */}
          <NavLink to="/" className="flex-shrink-0">
            <img
              src={siyanatiLogo}
              alt="Siyanati Logo"
              className="h-22 w-22 sm:h-28 sm:w-28 object-contain"
            />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-font-primary px-4 py-1.5 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-white text-secondary font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/[0.07]"
                  }`
                }>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right side — desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher />
            {isAuth ? (
              // ── Authenticated: icon buttons ──────────────────────────────────
              <>
                {icons.map((icon) => (
                  icon.name === "Notifications" ? (
                    <NotificationDropdown 
                      key={icon.name} 
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                        selectedIcon === icon.name
                          ? "bg-white text-secondary shadow-md scale-105"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                      iconClassName="!w-[18px] !h-[18px]"
                    />
                  ) : (
                  <NavLink
                    key={icon.name}
                    onClick={() => setSelectedIcon(icon.name)}
                    aria-label={icon.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      selectedIcon === icon.name
                        ? "bg-white text-secondary shadow-md scale-105"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    to={icon.link}>
                    {icon.icon}
                  </NavLink>
                  )
                ))}
                <button
                  onClick={handleLogout}
                  aria-label={t("nav_logout")}
                  className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-red-400 hover:text-white hover:bg-red-500/20"
                  title={t("nav_logout")}>
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              // ── Guest: Log in + Sign up ──────────────────────────────────────
              <>
                <NavLink
                  to="/login"
                  className="text-sm text-white/70 hover:text-white px-4 py-1.5 rounded-lg transition-colors duration-150 hover:bg-white/[0.07]">
                  {t("nav_login")}
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-sm font-semibold bg-white text-secondary px-4 py-1.5 rounded-lg transition-all duration-150 hover:bg-white/90 hover:shadow-md">
                  {t("nav_register")}
                </NavLink>
              </>
            )}
          </div>

          {/* Hamburger — mobile & tablet */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="lg:hidden text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </header>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile / Tablet Drawer */}
      <div
        ref={drawerRef}
        className={`lg:hidden fixed top-[90px] left-4 right-4 sm:left-6 sm:right-6 z-40 bg-primary-dark/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
          menuOpen
            ? "max-h-[calc(100vh-110px)] opacity-100 py-2"
            : "max-h-0 opacity-0 py-0"
        }`}>
        {/* Nav links */}
        <nav className="flex flex-col px-4 pt-3 gap-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${index * 50}ms` : "0ms" }}
              className={({ isActive }) =>
                `text-sm font-font-primary px-4 py-3 rounded-lg transition-all duration-300 transform ${
                  menuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                } ${
                  isActive
                    ? "bg-white text-secondary font-bold shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/[0.07]"
                }`
              }>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="h-px bg-white/[0.07] mx-4 my-3" />

        <div className="px-4 pb-3 flex justify-center">
          <LanguageSwitcher />
        </div>

        {isAuth ? (
          // ── Authenticated mobile: icon row ─────────────────────────────────
          <div className="px-4 pb-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold">
              {t("nav_quick_actions")}
            </p>
            <div className="flex gap-2">
              {icons.map((icon, index) => (
                <NavLink
                  key={icon.name}
                  to={icon.link}
                  onClick={() => {
                    setSelectedIcon(icon.name);
                    setMenuOpen(false);
                  }}
                  aria-label={icon.label}
                  style={{
                    transitionDelay: menuOpen
                      ? `${menuItems.length * 50 + index * 40}ms`
                      : "0ms",
                  }}
                  className={`flex-1 h-11 flex items-center justify-center rounded-lg transition-all duration-300 transform ${
                    menuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  } ${
                    selectedIcon === icon.name
                      ? "bg-white text-secondary shadow-lg"
                      : "bg-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.12]"
                  }`}>
                  {icon.icon}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                aria-label={t("nav_logout")}
                style={{
                  transitionDelay: menuOpen
                    ? `${menuItems.length * 50 + icons.length * 40}ms`
                    : "0ms",
                }}
                className={`flex-1 h-11 flex items-center justify-center rounded-lg transition-all duration-300 transform ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                } bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500`}>
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          // ── Guest mobile: Log in + Sign up stacked ─────────────────────────
          <div
            className="px-4 pb-4 flex flex-col gap-2"
            style={{
              transitionDelay: menuOpen ? `${menuItems.length * 50}ms` : "0ms",
            }}>
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm text-white/70 hover:text-white px-4 py-3 rounded-lg border border-white/[0.12] hover:bg-white/[0.07] transition-colors duration-150">
              {t("nav_login")}
            </NavLink>
            <NavLink
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm font-semibold bg-white text-secondary px-4 py-3 rounded-lg hover:bg-white/90 transition-colors duration-150">
              {t("nav_register")}
            </NavLink>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
