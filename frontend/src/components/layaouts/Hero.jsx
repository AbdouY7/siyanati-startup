import React from "react";

import heroImage from "../../assets/img/syanati-hero-pic.png";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FiArrowRight } from "react-icons/fi";

const Hero = () => {
  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-gradient-to-tl from-white via-blue-200 to-blue-400  lg:to-blue-200 overflow-hidden  ">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-between gap-6 px-10 xl:px-16 h-full min-h-[calc(100vh-60px)] py-10">
        <div className="flex flex-col gap-12 items-baseline max-w-[55%]">
          <div className="flex flex-col w-full gap-6 text-center md:text-left">
            <h1 className="text-[80px] xl:text-[80px] font-bold font-secondary text-black leading-[1.2] uppercase">
              Pièces auto & réparations, en un seul{" "}
              <b className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                endroit
              </b>
            </h1>
            <p className="text-[16px] text-gray-700  font-medium font-primary tracking-wide w-[80%]  ">
              SIYANATI, la plateforme qui vous permet de trouver vos pièces de
              voiture facilement
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <AnimatedButton
              variant="primary"
              className="px-8 py-4"
              icon={<FiArrowRight size={20} />}
              iconPosition="right"
              iconRight>
              commencez avec SIYANATI
            </AnimatedButton>
            <AnimatedButton variant="secondary">
              soyez professionnel SIYANATI
            </AnimatedButton>
          </div>
        </div>
        <img className="w-1/2 h-auto" src={heroImage} alt="Siyanati hero" />
      </div>

      {/* Mobile & Tablet layout */}
      <div className="lg:hidden flex flex-col min-h-[calc(100vh-60px)]">
        {/* Top: text + buttons */}
        <div className="flex flex-col gap-6 px-5 sm:px-10 pt-8 sm:pt-12 pb-4">
          <h1 className="text-[42px] sm:text-[56px] font-bold font-secondary text-black leading-[1.15] uppercase text-left">
            Pièces auto & réparations, en un seul{" "}
            <b className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              endroit
            </b>
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-700 font-medium font-primary tracking-wide">
            SIYANATI, la plateforme qui vous permet de trouver vos pièces de
            voiture facilement
          </p>

          {/* Buttons — stacked on mobile, side by side on tablet */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <AnimatedButton
              variant="primary"
              className="w-full sm:flex-1 px-6 py-3.5 text-sm"
              icon={<FiArrowRight size={18} />}
              iconPosition="right"
              iconRight>
              commencez avec SIYANATI
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              className="w-full sm:flex-1 px-6 py-3.5 text-sm">
              soyez professionnel SIYANATI
            </AnimatedButton>
          </div>
        </div>

        {/* Bottom: image bleeds to edges */}
        <div className="flex-1 flex items-end mt-4">
          <img
            className="w-full h-auto object-contain object-bottom drop-shadow-2xl"
            src={heroImage}
            alt="Siyanati hero"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
