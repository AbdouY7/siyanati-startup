import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FiUser, FiMessageSquare, FiInfo, FiMenu, FiX } from "react-icons/fi";
import siyanatiLogo from "../../assets/img/siyanati-vertical-logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const drawerRef = useRef(null);

  const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Catalogues", href: "/catalogues" },
    { name: "Magasins", href: "/magasins" },
    { name: "Professionnels", href: "/professionnels" },
    { name: "Diagnostic", href: "/diagnostic" },
  ];

  const icons = [
    { name: "User", icon: <FiUser size={18} /> },
    { name: "Message", icon: <FiMessageSquare size={18} /> },
    { name: "Info", icon: <FiInfo size={18} /> },
  ];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="bg-primary-dark flex items-center justify-between px-4 sm:px-6 lg:px-10 h-[60px] border-b border-white/[0.07] relative z-50 max-w-[100vw] overflow-x-hidden">
        {/* Logo */}
        <img
          src={siyanatiLogo}
          alt="Siyanati Logo"
          className="h-8 w-auto flex-shrink-0"
        />

        {/* Desktop Nav — hidden on mobile & tablet */}
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Icons — desktop only */}
          <div className="hidden lg:flex items-center gap-1">
            {icons.map((icon) => (
              <button
                key={icon.name}
                onClick={() => setSelectedIcon(icon.name)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ease-out ${
                  selectedIcon === icon.name
                    ? "bg-white text-secondary shadow-lg scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}>
                {icon.icon}
              </button>
            ))}
          </div>

          {/* Hamburger — visible on mobile & tablet only */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="lg:hidden text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ease-out">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </header>

      {/* Overlay backdrop */}
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
        className={`lg:hidden fixed top-[60px] left-0 right-0 z-40 bg-primary-dark border-b border-white/[0.07] transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0"
        }`}>
        <nav className="flex flex-col px-4 py-3 gap-1">
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

        {/* Divider */}
        <div className="h-px bg-white/[0.07] mx-4 my-2" />

        {/* Mobile Icons Section */}
        <div className="px-4 py-3">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold">
            Actions rapides
          </p>
          <div className="flex gap-2">
            {icons.map((icon, index) => (
              <button
                key={icon.name}
                onClick={() => setSelectedIcon(icon.name)}
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
