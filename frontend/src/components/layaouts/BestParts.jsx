import React, { useRef, useState, useEffect } from "react";
import AnimatedButton from "../uiComponents/Animatedbutton";
import PartCard from "../uiComponents/PartCard";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const BestParts = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const parts = [
    {
      id: 1,
      title: "Filtre à huile",
      details: "Bosch • Réf. F026407006",
      description:
        "Filtre à huile moteur haute performance compatible avec la majorité des véhicules européens et asiatiques.",
      price: 850,
      status: 4.5,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Plaquettes de frein avant",
      details: "Brembo • Réf. P85020",
      description:
        "Plaquettes de frein avant en céramique offrant une performance de freinage optimale et une faible usure.",
      price: 2400,
      status: 4.8,
      image:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Batterie 12V 70Ah",
      details: "Varta • Réf. E11",
      description:
        "Batterie voiture 12V 70Ah 640A, idéale pour les véhicules à démarrage fréquent et les climats froids.",
      price: 8500,
      status: 4.3,
      image:
        "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Amortisseur avant droit",
      details: "Monroe • Réf. G8070",
      description:
        "Amortisseur à gaz avant droit pour une tenue de route précise et un confort de conduite amélioré.",
      price: 5200,
      status: 4.1,
      image:
        "https://images.unsplash.com/photo-1635273051293-fb89adda59e4?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Courroie de distribution",
      details: "Gates • Réf. T43157",
      description:
        "Kit courroie de distribution complet avec tendeur et pompe à eau, pour une révision fiable et durable.",
      price: 6800,
      status: 4.6,
      image:
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Radiateur de refroidissement",
      details: "Valeo • Réf. 732632",
      description:
        "Radiateur aluminium haute efficacité pour moteur essence et diesel, montage direct sans modification.",
      price: 12000,
      status: 4.2,
      image:
        "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=300&fit=crop",
    },
    {
      id: 7,
      title: "Bougie d'allumage",
      details: "NGK • Réf. BKR6EK (x4)",
      description:
        "Bougies iridium longue durée pour une combustion optimale, moins de consommation et démarrage facile.",
      price: 1800,
      status: 4.7,
      image:
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      title: "Alternateur 90A",
      details: "Valeo • Réf. 436610",
      description:
        "Alternateur reconditionné 90A compatible Peugeot, Citroën et Renault. Garanti 12 mois.",
      price: 14500,
      status: 3.9,
      image:
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
    },
  ];

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
            {parts.map((part) => (
              <div key={part.id}>
                <PartCard
                  title={part.title}
                  details={part.details}
                  description={part.description}
                  price={part.price}
                  status={part.status}
                  image={part.image}
                  isConnected={false}
                  onVoirPlus={() => alert(`Voir plus sur ${part.title}`)}
                />
              </div>
            ))}
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
            iconRight>
            commencez avec SIYANATI
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default BestParts;
