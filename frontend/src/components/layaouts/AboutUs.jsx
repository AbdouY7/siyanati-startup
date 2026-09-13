import React from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../uiComponents/Animatedbutton";
import aboutUsImage from "../../assets/img/aboutusPicture.png";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-10 px-5 sm:px-10 lg:px-20 py-16 h-full bg-gradient-to-bl from-white via-blue-200 to-white">
      {/* Text + Button */}
      <div className="flex flex-col gap-10 items-center lg:items-start w-full lg:w-1/2">
        <div className="flex flex-col gap-6 items-center lg:items-start">
          <h1 className="text-[32px] sm:text-[42px] lg:text-[80px] font-bold font-secondary text-primary leading-[1.2] uppercase text-center lg:text-left">
            {t("about_heading")}
          </h1>
          <p className="text-[16px] text-gray-700 font-medium font-primary tracking-wide w-full lg:w-[80%] text-center lg:text-left">
            {t("about_desc")}
          </p>
        </div>

        <AnimatedButton
          variant="secondary"
          className="w-full max-w-xs sm:w-auto self-center lg:self-start justify-center"
          onClick={() => navigate("/register-role")}>
          {t("hero_btn_pro")}
        </AnimatedButton>
      </div>

      {/* Image — below text on mobile, side by side on desktop */}
      <img
        className="h-auto w-full sm:w-1/2 lg:w-1/3"
        src={aboutUsImage}
        alt="About SIYANATI"
      />
    </div>
  );
};

export default AboutUs;
