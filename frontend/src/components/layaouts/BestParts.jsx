import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../uiComponents/Animatedbutton";
import PartCard from "../uiComponents/PartCard";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getAllParts } from "../../services/partService";

const BestParts = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [dbParts, setDbParts] = useState([]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const data = await getAllParts();
        if (data && data.length > 0) {
          // Take up to 8 parts
          setDbParts(data.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch featured parts", err);
      }
    };
    fetchParts();
  }, []);

  // Update button visibility based on scroll position
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  // Shared glass button classes
  const btnBase = `
    absolute top-1/2 -translate-y-1/2 z-10
    w-11 h-11 flex items-center justify-center
    rounded-full
    bg-white/30 backdrop-blur-md
    border border-white/50
    shadow-lg shadow-blue-200/40
    text-primary
    transition-all duration-300 ease-in-out
    hover:bg-white/60 hover:scale-110 hover:shadow-xl hover:shadow-blue-300/50
    active:scale-95
  `;

  return (
    <div className="flex flex-col gap-10 px-5 sm:px-10 lg:px-20 py-16 bg-gradient-to-bl from-white via-blue-200 to-white">
      {/* Section header */}
      <div className="flex flex-col gap-3 text-center md:text-left">
        <h1 className="text-[48px] sm:text-[60px] lg:text-[72px] font-bold font-secondary text-primary leading-[1.2] uppercase">
          <b className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Pièces
          </b>{" "}
          en vedette
        </h1>
        <p className="text-[15px] text-gray-600 font-primary font-medium tracking-wide">
          Découvrez notre sélection des meilleures pièces automobiles du moment.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Scroll container with arrow buttons */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className={`
              ${btnBase} left-0 -translate-x-1/2
              ${
                canScrollLeft
                  ? "opacity-100 pointer-events-auto translate-x-[-50%]"
                  : "opacity-0 pointer-events-none translate-x-0"
              }
            `}>
            <FiChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* Cards row */}
          <div
            ref={scrollRef}
            className="flex flex-row gap-4 overflow-x-auto no-scrollbar scroll-smooth  py-2">
            {dbParts.map((part) => {
              const comp = part.compatibilities?.[0];
              const brand = comp?.brand?.name || "Universel";
              const cat = part.category?.name || "Pièce";
              
              return (
                <div key={part.id}>
                  <PartCard
                    title={part.name}
                    details={`${brand} • ${cat}`}
                    description={part.description || "Aucune description."}
                    price={Number(part.price_dzd)}
                    status={4.5} // default rating
                    image={part.images?.[0]}
                    isConnected={true}
                    onVoirPlus={() => window.location.href = `/part-details/${part.id}`}
                    onAchetez={() => window.location.href = `/part-details/${part.id}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className={`
              ${btnBase} right-0 translate-x-1/2
              ${
                canScrollRight
                  ? "opacity-100 pointer-events-auto translate-x-[50%]"
                  : "opacity-0 pointer-events-none translate-x-0"
              }
            `}>
            <FiChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <AnimatedButton
            variant="primary"
            className="px-8 py-4 self-start"
            icon={<FiArrowRight size={20} />}
            iconPosition="right"
            iconRight
            onClick={() => navigate("/register")}>
            commencez avec SIYANATI
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default BestParts;
