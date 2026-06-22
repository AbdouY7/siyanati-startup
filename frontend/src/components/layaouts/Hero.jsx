import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/img/syanati-hero-pic.png";
import AnimatedButton from "../uiComponents/Animatedbutton";
import { FiArrowRight } from "react-icons/fi";

const Hero = () => {
  const headingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden flex items-center justify-center pb-16">
      {/* Background image */}
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        style={{ filter: "brightness(0.45) saturate(1.1)" }}
      />

      {/* Gradient overlays for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,15,40,0.55) 0%, rgba(5,15,40,0.25) 40%, rgba(5,15,40,0.70) 100%)",
        }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Content */}
      <div
        ref={headingRef}
        className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 max-w-4xl mx-auto pt-20 sm:pt-24">
        {/* Eyebrow pill */}
        <div
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            letterSpacing: "0.12em",
          }}>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#38bdf8" }}
          />
          La plateforme automobile N°1 en Algérie
        </div>

        {/* Main heading */}
        <h1
          className="font-bold uppercase leading-[1.08] mb-6"
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            color: "#ffffff",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
          }}>
          Pièces auto & <span style={{ color: "#ffffff" }}>réparations,</span>
          <br />
          en un seul{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #38bdf8, #2563eb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            ENDROIT
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="mb-10 max-w-lg"
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            lineHeight: 1.65,
            fontWeight: 400,
          }}>
          SIYANATI, la plateforme qui vous permet de trouver vos pièces de
          voiture facilement — partout en Algérie.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <AnimatedButton
            variant="primary"
            className="px-8 py-4 text-base"
            style={{
              backdropFilter: "blur(12px)",
            }}
            icon={<FiArrowRight size={18} />}
            iconPosition="right"
            iconRight
            onClick={() => navigate("/register")}>
            commencez avec SIYANATI
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            className="px-8 py-4 text-base"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.30)",
              color: "#ffffff",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => navigate("/register-role")}>
            soyez professionnel SIYANATI
          </AnimatedButton>
        </div>
      </div>

      {/* Floating trust card straddling the hero bottom edge */}
      <div
        className="absolute bottom-0 left-1/2 w-full max-w-2xl px-6"
        style={{ transform: "translate(-50%, 50%)", zIndex: 20 }}></div>
    </div>
  );
};

export default Hero;
