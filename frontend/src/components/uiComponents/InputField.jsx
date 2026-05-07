import React from "react";

const InputField = ({
  iconRight: IconRight,
  iconLeft: IconLeft,
  placeholder,
  name,
  type,
  style,
  value,
  onChange,
  onClick,
}) => {
  const stylesVariant = [
    {
      name: "default",
      style:
        "border border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-100 transition duration-150 ease-in-out w-full",
    },
    {
      name: "error",
      style:
        "border border-red-500 focus:ring-red-500 focus:border-red-500 px-4 py-2 rounded-md focus:outline-none transition duration-150 ease-in-out w-full",
    },
    {
      name: "success",
      style:
        "border border-green-500 focus:ring-green-500 focus:border-green-500 px-4 py-2 rounded-md focus:outline-none transition duration-150 ease-in-out w-full",
    },
    {
      name: "disabled",
      style:
        "border border-gray-300 bg-gray-100 cursor-not-allowed px-4 py-2 rounded-md transition duration-150 ease-in-out w-full",
    },
    {
      name: "solid-secondary",
      style:
        "bg-secondary px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-gray-100 text-white font-bold cursor-pointer hover:bg-primary hover:shadow-lg transition duration-300 ease-in-out w-full",
    },
    {
      name: "outline",
      style:
        "bg-white border border-primary text-primary px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-primary hover:text-white hover:shadow-lg transition duration-300 ease-in-out w-full",
    },
    {
      name: "solid",
      style:
        "bg-primary px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-gray-100 text-white font-bold cursor-pointer hover:bg-secondary hover:shadow-lg transition duration-300 ease-in-out w-full",
    },
  ];

  const isButton = type === "button" || type === "submit" || type === "reset";

  return (
    <div className="relative w-full">
      {IconLeft && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {/* 👇 call it as a function if it's a render function, or as JSX if it's a component */}
          {
            typeof IconLeft === "function" &&
            IconLeft.prototype?.isReactComponent === undefined ? (
              IconLeft() // render function: () => <button>...</button>
            ) : (
              <IconLeft />
            ) // React component: EyeIcon
          }
        </div>
      )}
      <input
        type={type}
        name={name}
        value={isButton ? undefined : value}
        onChange={isButton ? undefined : onChange}
        onClick={isButton ? onClick : undefined}
        {...(isButton ? { value: placeholder } : { placeholder })}
        className={`
          ${stylesVariant.find((variant) => variant.name === style)?.style}
          ${IconLeft ? "pl-10" : ""}
          ${IconRight ? "pr-10" : ""}
        `}
      />
      {IconRight && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {/* 👇 call it as a function if it's a render function, or as JSX if it's a component */}
          {
            typeof IconRight === "function" &&
            IconRight.prototype?.isReactComponent === undefined ? (
              IconRight() // render function: () => <button>...</button>
            ) : (
              <IconRight />
            ) // React component: EyeIcon
          }
        </div>
      )}
    </div>
  );
};

export default InputField;
