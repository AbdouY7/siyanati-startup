import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineChat } from "react-icons/md";
import { Link } from "react-router-dom";

/**
 * ProfessionalCard
 * Props: id, name, specialty, avatar, wilaya, rating, isAvailable
 */
const ProfessionalCard = ({
  id,
  name,
  specialty,
  avatar,
  wilaya,
  rating,
  isAvailable,
}) => {
  const [chatPressed, setChatPressed] = useState(false);
  const [infoPressed, setInfoPressed] = useState(false);
  const [openPressed, setOpenPressed] = useState(false);

  return (
    <div className="group w-full bg-white rounded-[18px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
      {/* Avatar image — square crop like the screenshot */}
      <div className="w-full h-[148px] overflow-hidden bg-slate-100">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[350ms] ease-out"
        />
      </div>

      {/* Card body */}
      <div className="px-3.5 pt-3 pb-2.5">
        <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-0.5 truncate">
          {name}
        </h3>
        <p className="text-[12px] text-gray-500 mb-0.5 truncate">{specialty}</p>
        <p className="text-[12px] text-gray-400 mb-2">{wilaya}</p>

        {/* Rating + availability */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-900">
              {rating}
            </span>
            <FaStar className="text-amber-400 text-[12px]" />
          </div>
          <Link
            to={`/professionals/${id}`}
            onMouseDown={() => setOpenPressed(true)}
            onMouseUp={() => setOpenPressed(false)}
            onMouseLeave={() => setOpenPressed(false)}
            className={`text-[12px] font-semibold no-underline px-2 py-0.5 rounded-lg transition-all duration-150
              ${
                isAvailable
                  ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                  : "text-gray-400 hover:bg-gray-100"
              }
              ${openPressed ? "scale-95 bg-emerald-100" : "scale-100"}`}>
            {isAvailable ? "Valable" : "Indisponible"}
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-2.5" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/professionnels/${id}/chat`}
            onMouseDown={() => setChatPressed(true)}
            onMouseUp={() => setChatPressed(false)}
            onMouseLeave={() => setChatPressed(false)}
            className={`flex flex-1 items-center justify-center gap-1.5 no-underline bg-blue-600 text-white text-[12px] font-medium rounded-[10px] py-[7px] px-2
              shadow-[0_2px_6px_rgba(59,130,246,0.3)]
              hover:bg-blue-700 hover:shadow-[0_4px_10px_rgba(59,130,246,0.4)] hover:-translate-y-px
              transition-all duration-150
              ${chatPressed ? "scale-95 shadow-none translate-y-0" : "scale-100"}`}>
            <MdOutlineChat className="text-sm shrink-0" />
            <span>Descusion</span>
          </Link>

          <Link
            to={`/professionnels/${id}`}
            onMouseDown={() => setInfoPressed(true)}
            onMouseUp={() => setInfoPressed(false)}
            onMouseLeave={() => setInfoPressed(false)}
            aria-label="Voir le profil"
            className={`flex items-center justify-center no-underline w-[32px] h-[32px] shrink-0 bg-slate-100 text-slate-500 rounded-[10px]
              hover:bg-slate-200 hover:text-slate-800
              transition-all duration-150
              ${infoPressed ? "scale-95" : "scale-100"}`}>
            <IoMdInformationCircleOutline className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;
