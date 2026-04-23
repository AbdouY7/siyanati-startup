import React, { useState } from "react";
import { FiArrowRight, FiShoppingCart, FiStar } from "react-icons/fi";

const PartCard = ({
  title,
  details,
  description,
  price,
  status,
  isConnected,
  image,
  onVoirPlus,
  onAchetez,
}) => {
  const [pressed, setPressed] = useState(null); // "voir" | "achetez"

  const handlePress = (key, cb) => {
    setPressed(key);
    setTimeout(() => setPressed(null), 200);
    cb?.();
  };

  // Render stars from rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={12}
        className={
          i < Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }
      />
    ));
  };

  return (
    <div
      className="
        group relative flex flex-col bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20
        min-w-[280px] max-w-[320px]
      ">
      {/* Image area */}
      <div className="relative w-full h-44 bg-gray-50 overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <FiShoppingCart size={40} className="text-gray-300" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-secondary font-bold font-primary text-sm px-3 py-1 rounded-full shadow-sm border border-secondary/20">
          {price.toFixed(2)} DA
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Title + details */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-bold font-secondary uppercase line-clamp-1 text-gray-900 leading-snug  group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-[12px] font-primary text-gray-400 tracking-wide uppercase font-medium">
            {details}
          </p>
        </div>

        {/* Description */}
        <p className="text-[13px] font-primary text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">{renderStars(status)}</div>
          <span className="text-[12px] text-gray-400 font-primary font-medium">
            {Number(status).toFixed(1)}/5
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Buttons */}
        <div
          className={`grid gap-2 ${isConnected ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Voir plus — always visible */}
          <button
            onClick={() => handlePress("voir", onVoirPlus)}
            className={`
              flex items-center justify-center gap-1.5
              px-4 py-2.5 rounded-xl text-[13px] font-semibold font-primary
              border border-primary text-primary
              transition-all duration-150 ease-in-out
              hover:bg-primary hover:text-white
              ${pressed === "voir" ? "scale-95 bg-primary text-white" : "scale-100"}
            `}>
            Voir plus
            <FiArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>

          {/* Achetez — only when connected */}
          {isConnected && (
            <button
              onClick={() => handlePress("achetez", onAchetez)}
              className={`
                flex items-center justify-center gap-1.5
                px-4 py-2.5 rounded-xl text-[13px] font-semibold font-primary
                bg-secondary text-white border border-secondary
                transition-all duration-150 ease-in-out
                hover:bg-secondary/90 hover:shadow-md hover:shadow-secondary/30
                ${pressed === "achetez" ? "scale-95 shadow-inner" : "scale-100"}
              `}>
              <FiShoppingCart size={13} />
              Achetez
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartCard;
