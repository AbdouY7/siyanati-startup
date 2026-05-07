import { useState, useRef } from "react";
import testimonialImage from "../../assets/img/testimonialPic.png";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import ListDots from "../uiComponents/ListDots";
import { GlassIconButton } from "../uiComponents/GlassIconButton";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const Testimonial = () => {
  const testimonials = [
    {
      name: "John Doe",
      place: "Alger",
      feedback:
        "Siyanati a transformé la façon dont j'entretiens ma voiture. Le diagnostic en ligne m'a permis d'identifier rapidement une panne, et j'ai pu trouver les pièces nécessaires facilement. Je recommande vivement !",
    },
    {
      name: "Jane Smith",
      place: "Oran",
      feedback:
        "En tant que professionnel de l'automobile, Siyanati m'a permis d'élargir ma clientèle et de gérer mes rendez-vous plus efficacement. La plateforme est intuitive et le support est excellent.",
    },
    {
      name: "Jane Smith",
      place: "Oran",
      feedback:
        "En tant que professionnel de l'automobile, Siyanati m'a permis d'élargir ma clientèle et de gérer mes rendez-vous plus efficacement. La plateforme est intuitive et le support est excellent.",
    },
  ];

  const [isSelected, setIsSelected] = useState(0);
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left → next
        setIsSelected((prev) =>
          prev === testimonials.length - 1 ? 0 : prev + 1,
        );
      } else {
        // swipe right → prev
        setIsSelected((prev) =>
          prev === 0 ? testimonials.length - 1 : prev - 1,
        );
      }
    }
  };

  const testimonial = testimonials[isSelected];

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-900 via-blue-950/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 px-6 py-8">
        {/* Title — centered on mobile, left on desktop */}
        <h1 className="text-white font-bold font-secondary text-center md:text-left text-2xl md:text-3xl mt-4 md:mt-10 md:mx-6">
          LES AVIS DE SIYANATI CLIENTS
        </h1>

        {/* MOBILE LAYOUT */}
        <div className="flex flex-col items-center md:hidden mt-4">
          {/* Opening quote */}
          <BiSolidQuoteLeft size={80} className="text-primary self-end mr-4" />

          {/* Swipeable testimonial area */}
          <div
            className="w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}>
            <div
              key={isSelected}
              className="flex flex-col items-center gap-3 px-4 text-center font-primary">
              <p className="text-gray-300 leading-relaxed">
                "{testimonial.feedback}"
              </p>
              <hr className="border-white rounded-full w-1/2 border-[2px]" />
              <p className="font-semibold text-white">{testimonial.name}</p>
              <p className="text-gray-400 text-sm">{testimonial.place}</p>
            </div>
          </div>

          {/* Dots — centered, no arrows on mobile */}
          <div className="mt-4">
            <ListDots
              count={testimonials.length}
              selectedIndex={isSelected}
              variant="primary"
            />
          </div>

          {/* Closing quote */}
          <BiSolidQuoteRight
            size={80}
            className="text-primary self-start ml-4 mt-2"
          />

          {/* Car image */}
          <img
            src={testimonialImage}
            alt="Testimonial"
            className="w-full mt-4 rounded-full"
          />
        </div>

        {/* DESKTOP LAYOUT — original design */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between gap-4 mx-6">
            <div className="flex flex-col gap-4 text-white text-left flex-1">
              <div
                key={isSelected}
                className="flex flex-col gap-3 w-2/3 h-[160px] font-primary">
                <p className="text-gray-300 leading-relaxed">
                  "{testimonial.feedback}"
                </p>
                <hr className="border-white rounded-full w-3/4 border-[2px]" />
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.place}</p>
              </div>

              {/* Dots + arrows on desktop */}
              <div className="flex flex-row items-center gap-4 mt-2">
                <ListDots
                  count={testimonials.length}
                  selectedIndex={isSelected}
                  variant="primary"
                />
                <GlassIconButton
                  icon={<FaAngleLeft />}
                  onClick={() =>
                    setIsSelected((prev) =>
                      prev === 0 ? testimonials.length - 1 : prev - 1,
                    )
                  }
                />
                <GlassIconButton
                  icon={<FaAngleRight />}
                  onClick={() =>
                    setIsSelected((prev) =>
                      prev === testimonials.length - 1 ? 0 : prev + 1,
                    )
                  }
                />
              </div>
            </div>

            <BiSolidQuoteLeft
              size={250}
              className="text-primary flex-shrink-0 mt-2 mr-20"
            />
          </div>

          <div className="flex items-center justify-between px-4 w-full">
            <BiSolidQuoteRight size={200} className="text-primary" />
            <img
              src={testimonialImage}
              alt="Testimonial"
              className="w-2/3 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
