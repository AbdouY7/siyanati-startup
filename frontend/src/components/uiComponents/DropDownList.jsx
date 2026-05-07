import React from "react";

const DropDownList = ({ name, placeholder, options, value, onChange }) => {
  return (
    <div className="relative w-full max-w-[280px]">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          appearance-none
          rounded-lg
          border-2 border-blue-500
          bg-white
          px-4 py-2
          pr-10
          text-[15px] font-medium
          text-blue-500
          outline-none
          transition
          focus:ring-4 focus:ring-blue-200
        ">
        {placeholder && (
          <option default value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Arrow */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </div>
    </div>
  );
};

export default DropDownList;
