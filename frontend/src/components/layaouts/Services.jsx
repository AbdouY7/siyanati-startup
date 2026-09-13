import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FaCogs, FaCreditCard } from "react-icons/fa";
import { BiSolidCarMechanic } from "react-icons/bi";
import { RiStethoscopeLine } from "react-icons/ri";
import { FiArrowRight } from "react-icons/fi";
import serviceImage from "../../assets/img/servicesPicture.png";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const services = [
    {
      title: t("service_1_title"),
      icon: <FaCogs size={36} />,
      description: t("service_1_desc"),
    },
    {
      title: t("service_2_title"),
      icon: <BiSolidCarMechanic size={36} />,
      description: t("service_2_desc"),
    },
    {
      title: t("service_3_title"),
      icon: <RiStethoscopeLine size={36} />,
      description: t("service_3_desc"),
    },
    {
      title: t("service_4_title"),
      icon: <FaCreditCard size={36} />,
      description: t("service_4_desc"),
    },
  ];

  // Auto-cycle through cards unless user is hovering
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered, services.length]);

  return (
    <div className="px-5 sm:px-10 lg:px-20 py-16 flex flex-col gap-12 bg-gradient-to-br from-white via-blue-200 to-white">
      {/* Top: title/description + image */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-col gap-6 max-w-[600px] items-center lg:items-start text-center lg:text-left">
          <h1 className="text-[28px] sm:text-[48px] lg:text-[72px] font-bold font-secondary text-primary leading-[1.2] uppercase w-full lg:w-[70%]">
            {t("services_heading")}
          </h1>
          <p className="text-[16px] text-gray-700 font-medium font-primary tracking-wide">
            {t("services_desc")}
          </p>
        </div>
        <img
          src={serviceImage}
          alt="Our Services"
          className="w-full sm:w-1/2 lg:w-1/3 h-auto"
        />
      </div>

      {/* Service Cards Grid */}
      <div className="flex flex-col gap-8 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={index}
                onMouseEnter={() => {
                  setIsHovered(true);
                  setActiveIndex(index);
                }}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                  relative flex flex-col items-center gap-4 p-6 rounded-2xl border
                  cursor-pointer select-none overflow-hidden
                  transition-all duration-500 ease-in-out
                  ${isActive
                    ? "bg-secondary border-secondary text-white shadow-xl shadow-secondary/30 scale-[1.04]"
                    : "bg-white border-gray-100 text-gray-800 shadow-sm hover:shadow-md scale-100"
                  }
                `}
                style={{
                  transitionProperty:
                    "background-color, border-color, color, box-shadow, transform",
                }}>
                {/* Decorative background circle */}
                <div
                  className={`
                    absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-all duration-500
                    ${isActive ? "bg-white scale-150" : "bg-secondary scale-100"}
                  `}
                />

                {/* Icon */}
                <div
                  className={`
                    relative z-10 w-16 h-16 flex items-center justify-center rounded-xl
                    transition-all duration-500
                    ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}
                  `}>
                  {service.icon}
                </div>

                {/* Title */}
                <h2
                  className={`
                    relative z-10 text-[15px] font-bold font-secondary uppercase text-center leading-snug
                    transition-colors duration-500
                    ${isActive ? "text-white" : "text-gray-800"}
                  `}>
                  {service.title}
                </h2>

                {/* Description */}
                <p
                  className={`
                    relative z-10 text-[13px] text-center font-primary leading-relaxed
                    transition-colors duration-500
                    ${isActive ? "text-white/85" : "text-gray-500"}
                  `}>
                  {service.description}
                </p>

                {/* Active indicator dot */}
                <div
                  className={`
                    relative z-10 w-2 h-2 rounded-full mt-1
                    transition-all duration-500
                    ${isActive ? "bg-white opacity-100 scale-100" : "bg-secondary opacity-0 scale-0"}
                  `}
                />
              </div>
            );
          })}
        </div>

        {/* Button */}
        <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start w-full sm:w-auto items-center">
          <AnimatedButton
            variant="primary"
            className="px-8 py-4 w-full max-w-xs sm:w-auto justify-center"
            icon={<FiArrowRight size={20} />}
            iconPosition="right"
            iconRight
            onClick={() => navigate("/register")}>
            {t("hero_btn_start")}
          </AnimatedButton>
          <AnimatedButton
            variant="outline-white"
            className="border border-primary w-full max-w-xs sm:w-auto justify-center"
            onClick={() => navigate("/search")}>
            {t("service_btn_search")}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default Services;
