import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

/**
 * DropDownList — pill-style filter dropdown matching the Magasins page aesthetic.
 *
 * Props:
 *  name        – field name (string)
 *  placeholder – label shown when no option is selected (string)
 *  options     – array of { value, label } objects
 *  value       – currently selected value string (controlled)
 *  onChange    – called with the raw value string when an option is picked
 */
const DropDownList = ({ name, placeholder, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = value && value !== "";
  const activeLabel = isActive
    ? (options.find((o) => o.value === value)?.label ?? value)
    : null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all duration-150 font-medium whitespace-nowrap
          ${
            isActive
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}>
        <span>
          {placeholder}
          {isActive && (
            <span className="ml-1 font-semibold">· {activeLabel}</span>
          )}
        </span>
        <FiChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 min-w-[160px]">
          {/* "All / reset" option */}
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left text-sm px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors
              ${!isActive ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-400"}`}>
            Tous
          </button>

          <div className="my-1 border-t border-gray-100" />

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left text-sm px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors
                ${
                  value === option.value
                    ? "text-blue-700 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDownList;
