import React, { useState } from "react";

export const GlassIconButton = ({
  icon,
  onClick,
  className = "",
  ariaLabel = "Icon button",
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`
        relative
        w-10 h-10
        flex items-center justify-center
        rounded-full
        bg-white/10
        backdrop-blur-md
        border border-white/20
        text-white
        transition-all duration-300 ease-out
        hover:bg-white/20
        hover:border-white/30
        hover:shadow-lg
        hover:shadow-white/10
        ${isClicked ? "scale-95" : "scale-100"}
        active:scale-95
        ${className}
      `}>
      {icon}
    </button>
  );
};
