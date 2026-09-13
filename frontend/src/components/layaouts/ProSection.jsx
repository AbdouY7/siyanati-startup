import React from "react";
import { useNavigate } from "react-router-dom";
import Cards from "../uiComponents/Cards";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const ProSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-10 px-5 sm:px-10 lg:px-20 py-16 bg-gradient-to-bl from-white via-blue-200 to-white">
      <div className="flex flex-col gap-3 text-center lg:text-left items-center lg:items-start">
        <h1 className="text-[32px] md:text-[48px] font-bold font-secondary text-primary line-clamp-4 md:line-clamp-3 w-full max-w-3xl lg:max-w-none lg:w-1/2 leading-[1.2] uppercase">
          {t("pro_title_1")}
          <b className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            {" "}
            {t("pro_title_2")}
          </b>{" "}
        </h1>
      </div>
      <div className="flex flex-col gap-8 items-center justify-center w-full">
        <Cards />
        <AnimatedButton
          variant="secondary"
          className="px-8 py-4 w-full max-w-xs sm:w-auto justify-center"
          icon={<FiArrowRight size={20} />}
          iconPosition="right"
          iconRight
          onClick={() => navigate("/register")}>
          {t("hero_btn_start")}
        </AnimatedButton>
      </div>
    </div>
  );
};

export default ProSection;
