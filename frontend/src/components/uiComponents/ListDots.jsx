import React from "react";
import { GoDotFill } from "react-icons/go";

const ListDots = ({ count, selectedIndex, variant = "primary" }) => {
  const variants = {
    primary: {
      active: "bg-primary",
      inactive: "bg-white/50",
    },
    secondary: {
      active: "bg-secondary",
      inactive: "bg-white/50",
    },
  };
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={` w-3 h-3 rounded-full transition-colors duration-300 ${index === selectedIndex ? variants[variant].active : variants[variant].inactive}`}
        />
      ))}
    </div>
  );
};

export default ListDots;
