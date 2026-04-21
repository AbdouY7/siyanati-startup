import React from "react";
import { NavLink } from "react-router-dom";
import { FiUser, FiMessageSquare, FiInfo } from "react-icons/fi";
import siyanatiLogo from "../../assets/img/siyanati-vertical-logo.png";

const Header = () => {
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

  return (
    <header className="bg-primary-dark flex items-center justify-between px-10 h-[60px] border-b border-white/[0.07]">
      {/* Logo */}
      <img src={siyanatiLogo} alt="Siyanati Logo" className="h-8 w-auto" />

      {/* Nav — now a sibling, not nested inside the icon div */}
      <nav className="flex items-center gap-0.5">
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

      {/* Icons — separate sibling ✅ */}
      <div className="flex items-center gap-1">
        {icons.map((icon) => (
          <button
            key={icon.name}
            className="text-white/60 hover:text-white hover:bg-white/10 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150">
            {icon.icon}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
