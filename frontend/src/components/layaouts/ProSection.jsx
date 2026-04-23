import React from "react";
import Cards from "../uiComponents/Cards";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FiArrowRight } from "react-icons/fi";

const ProSection = () => {
  return (
    <div className="flex flex-col gap-10 px-5 sm:px-10 lg:px-20 py-16 bg-gradient-to-bl from-white via-blue-200 to-white">
      <div className="flex flex-col gap-3 text-center md:text-left">
        <h1 className="text-[32px] md:text-[48px] font-bold font-secondary text-primary line-clamp-4 md:line-clamp-3 w-full lg:w-1/2 leading-[1.2] uppercase">
          Comment devenir professionnel ou vendeur sur
          <b className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            {" "}
            SIYANATI ?
          </b>{" "}
        </h1>
      </div>
      <div className="flex flex-col gap-8 items-center justify-center">
        <Cards />
        <AnimatedButton
          variant="secondary"
          className="px-8 py-4"
          icon={<FiArrowRight size={20} />}
          iconPosition="right"
          iconRight>
          commencez avec SIYANATI
        </AnimatedButton>
      </div>
    </div>
  );
};

export default ProSection;
