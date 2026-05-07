import React, { useState, useEffect } from "react";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FaCogs, FaCreditCard } from "react-icons/fa";
import { BiSolidCarMechanic } from "react-icons/bi";
import { RiStethoscopeLine } from "react-icons/ri";
import { FiArrowRight } from "react-icons/fi";
import serviceImage from "../../assets/img/servicesPicture.png";

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const services = [
    {
      title: "Vente de pièces détachées",
      icon: <FaCogs size={36} />,
      description:
        "Un marché regroupant des pièces neuves et d'occasion, proposées par des vendeurs vérifiés, avec recherche avancée et compatibilité véhicule.",
    },
    {
      title: "Services de mécanique",
      icon: <BiSolidCarMechanic size={36} />,
      description:
        "Accès à un réseau de mécaniciens et électriciens qualifiés, avec devis, prise de rendez-vous et suivi des prestations.",
    },
    {
      title: "Diagnostic automobile en ligne",
      icon: <RiStethoscopeLine size={36} />,
      description:
        "Un outil intelligent permettant d'identifier rapidement les pannes possibles à partir des symptômes du véhicule, avec des recommandations adaptées.",
    },
    {
      title: "Gestion de flotte",
      icon: <FaCreditCard size={36} />,
      description:
        "Paiement simple et sécurisé via les solutions locales, avec facturation et historique des transactions.",
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
          <h1 className="text-[48px] sm:text-[60px] lg:text-[80px] font-bold font-secondary text-primary leading-[1.2] uppercase w-full md:w-0.7">
            services de SIYANATI
          </h1>
          <p className="text-[16px] text-gray-700 font-medium font-primary tracking-wide">
            Une plateforme complète pour simplifier l'entretien et la réparation
            automobile, du diagnostic au paiement.
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
                  ${
                    isActive
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
        <div className="flex flex-col gap-6 sm:flex-row justify-center lg:justify-start">
          <AnimatedButton
            variant="primary"
            className="px-8 py-4"
            icon={<FiArrowRight size={20} />}
            iconPosition="right"
            iconRight>
            commencez avec SIYANATI
          </AnimatedButton>
          <AnimatedButton
            variant="outline-white"
            className="ml-4 border border-primary"
            icon={<FiArrowRight size={20} />}
            iconPosition="right"
            iconRight>
            CHERCHER DES PIéces
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default Services;
