import { useState, useRef } from "react";
import testimonialImage from "../../assets/img/testimonialPic.png";
import ListDots from "../uiComponents/ListDots";
import { GlassIconButton } from "../uiComponents/GlassIconButton";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";

// Testimonials array moved inside component for translation


/* Avatar cluster — decorative floating circles with initials */
const avatarData = [
  {
    initials: "JD",
    bg: "#E1F5EE",
    color: "#0F6E56",
    size: 64,
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
  },
  {
    initials: "KM",
    bg: "#EEEDFE",
    color: "#534AB7",
    size: 50,
    top: 60,
    left: 12,
  },
  {
    initials: "JS",
    bg: "#FAECE7",
    color: "#993C1D",
    size: 70,
    top: 68,
    left: "50%",
    transform: "translateX(-38%)",
  },
  {
    initials: "LB",
    bg: "#FBEAF0",
    color: "#993556",
    size: 50,
    top: 60,
    right: 0,
  },
  {
    initials: "AR",
    bg: "#FAEEDA",
    color: "#854F0B",
    size: 54,
    top: 156,
    left: 18,
  },
  {
    initials: "MN",
    bg: "#E6F1FB",
    color: "#185FA5",
    size: 50,
    top: 162,
    right: 14,
  },
];

const AvatarCluster = () => (
  <div
    className="relative flex-shrink-0"
    style={{ width: 200, height: 230 }}
    aria-hidden="true">
    {avatarData.map((av, i) => (
      <div
        key={i}
        className="absolute rounded-full border-2 border-white flex items-center justify-center font-semibold"
        style={{
          width: av.size,
          height: av.size,
          top: av.top,
          left: av.left ?? "auto",
          right: av.right ?? "auto",
          transform: av.transform ?? "none",
          background: av.bg,
          color: av.color,
          fontSize: av.size * 0.28,
        }}>
        {av.initials}
      </div>
    ))}
  </div>
);

import { useTranslation } from "react-i18next";

const Testimonial = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: "John Doe",
      place: "Alger",
      initials: "JD",
      feedback: t("testi_feedback_1"),
    },
    {
      name: "Jane Smith",
      place: "Oran",
      initials: "JS",
      feedback: t("testi_feedback_2"),
    },
    {
      name: "Karim Mekki",
      place: "Constantine",
      initials: "KM",
      feedback: t("testi_feedback_3"),
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
      setIsSelected((prev) =>
        diff > 0
          ? (prev + 1) % testimonials.length
          : (prev - 1 + testimonials.length) % testimonials.length,
      );
    }
  };

  const prev = () =>
    setIsSelected((p) => (p === 0 ? testimonials.length - 1 : p - 1));
  const next = () =>
    setIsSelected((p) => (p === testimonials.length - 1 ? 0 : p + 1));

  const currentTesti = testimonials[isSelected];

  return (
    <section className="relative w-full overflow-hidden bg-black py-16 px-6">
      {/* Subtle top/bottom gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-900/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-950/80 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <h2 className="text-white font-bold font-secondary text-2xl md:text-3xl tracking-tight">
            {t("testi_header")}
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-primary">
            {t("testi_sub")}
          </p>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left: quote card + controls */}
          <div className="flex flex-col gap-6">
            {/* Card */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              {/* Large opening quote mark */}
              <span
                className="absolute -top-5 left-6 text-7xl leading-none text-emerald-500 font-serif select-none"
                aria-hidden="true">
                "
              </span>

              <p
                key={isSelected}
                className="text-slate-300 text-base leading-relaxed italic font-primary mt-4 mb-6">
                {currentTesti.feedback}
              </p>

              {/* Divider */}
              <div className="w-10 h-0.5 bg-emerald-500 rounded-full mb-4" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: avatarData[isSelected % avatarData.length].bg,
                    color: avatarData[isSelected % avatarData.length].color,
                  }}>
                  {currentTesti.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{currentTesti.name}</p>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <FiMapPin size={11} />
                    {currentTesti.place}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls: dots + arrows */}
            <div className="flex items-center gap-4">
              <ListDots
                count={testimonials.length}
                selectedIndex={isSelected}
                variant="primary"
              />
              <GlassIconButton icon={<FaAngleLeft />} onClick={prev} />
              <GlassIconButton icon={<FaAngleRight />} onClick={next} />
            </div>
          </div>

          {/* Right: avatar cluster */}
          <AvatarCluster />
        </div>

        {/* ── MOBILE layout ── */}
        <div
          className="flex flex-col items-center gap-6 md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}>
          <div className="relative w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <span
              className="absolute -top-5 left-5 text-7xl leading-none text-emerald-500 font-serif select-none"
              aria-hidden="true">
              "
            </span>
            <p
              key={isSelected}
              className="text-slate-300 text-sm leading-relaxed italic font-primary mt-4 mb-5 text-center">
              {currentTesti.feedback}
            </p>
            <div className="w-8 h-0.5 bg-emerald-500 rounded-full mb-3 mx-auto" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-white font-semibold text-sm">{currentTesti.name}</p>
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <FiMapPin size={11} /> {currentTesti.place}
              </p>
            </div>
          </div>

          <ListDots
            count={testimonials.length}
            selectedIndex={isSelected}
            variant="primary"
          />

          {/* Car image on mobile */}
          <img
            src={testimonialImage}
            alt="Voiture Siyanati"
            className="w-full rounded-2xl opacity-80 mt-2"
          />
        </div>

        {/* ── Car strip — desktop only ── */}
        <div className="hidden md:flex items-center gap-4 mt-14 pt-8 border-t border-white/10">
          <span className="text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap font-primary">
            {t("testi_car_1")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
          {/* Car image */}
          <img
            src={testimonialImage}
            alt="Voiture Siyanati"
            className="w-2/5 rounded-2xl opacity-70"
          />
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap font-primary">
            {t("testi_car_2")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
