import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineChat } from "react-icons/md";
import { Link } from "react-router-dom";

const ShopCards = ({ id, name, image, owner, wilaya, rating, available }) => {
  const [chatPressed, setChatPressed] = useState(false);
  const [infoPressed, setInfoPressed] = useState(false);
  const [openPressed, setOpenPressed] = useState(false);

  return (
    <div className="group w-full h-full flex flex-col bg-white rounded-[18px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer">
      {/* Shop Image */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100 relative shrink-0">
        <img
          src={image}
          alt={`${name} storefront`}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&q=80"; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[350ms] ease-out absolute inset-0"
        />
      </div>

      {/* Card Body */}
      <div className="px-3 pt-3 pb-3 flex flex-col flex-1">
        {/* Shop Info */}
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 leading-snug mb-0.5 truncate">
          {name}
        </h3>
        <p className="text-[12px] sm:text-[13px] text-gray-500 mb-0.5 truncate">{owner}</p>
        <p className="text-[12px] sm:text-[13px] text-gray-400 mb-2 truncate">{wilaya}</p>

        {/* Rating + Open Row */}
        <div className="flex items-center justify-between mb-3 mt-auto">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-900">
              {rating}
            </span>
            <FaStar className="text-amber-400 text-[12px] sm:text-[13px]" />
          </div>

          {available && (
            <Link
              to={`/shops/${id}`}
              onMouseDown={() => setOpenPressed(true)}
              onMouseUp={() => setOpenPressed(false)}
              onMouseLeave={() => setOpenPressed(false)}
              className={`text-[12px] sm:text-[13px] font-semibold text-emerald-500 no-underline px-2 py-0.5 rounded-lg transition-all duration-150
                hover:bg-emerald-50 hover:text-emerald-600
                ${openPressed ? "scale-95 bg-emerald-100" : "scale-100"}`}>
              Open
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-2.5" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Discussion Button */}
          <Link
            to={`/profile/chat?userId=${id}`}
            onMouseDown={() => setChatPressed(true)}
            onMouseUp={() => setChatPressed(false)}
            onMouseLeave={() => setChatPressed(false)}
            className={`flex flex-1 items-center justify-center gap-1.5 no-underline bg-blue-500 text-white text-[12px] sm:text-[13px] font-medium rounded-[10px] py-[6px] sm:py-[7px] px-2
              shadow-[0_2px_6px_rgba(59,130,246,0.3)]
              hover:bg-blue-600 hover:shadow-[0_4px_10px_rgba(59,130,246,0.4)] hover:-translate-y-px
              transition-all duration-150
              ${chatPressed ? "scale-95 shadow-none translate-y-0" : "scale-100"}`}>
            <MdOutlineChat className="text-[14px] sm:text-base shrink-0" />
            <span className="truncate hidden min-[370px]:block">Discussion</span>
          </Link>

          {/* Info Button */}
          <Link
            to={`/shops/${id}`}
            onMouseDown={() => setInfoPressed(true)}
            onMouseUp={() => setInfoPressed(false)}
            onMouseLeave={() => setInfoPressed(false)}
            aria-label="More information"
            className={`flex items-center justify-center no-underline w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] shrink-0 bg-slate-100 text-slate-500 rounded-[10px]
              hover:bg-slate-200 hover:text-slate-800
              transition-all duration-150
              ${infoPressed ? "scale-95" : "scale-100"}`}>
            <IoMdInformationCircleOutline className="text-[15px] sm:text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCards;
