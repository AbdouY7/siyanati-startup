import React from "react";
import Hero from "../components/layaouts/Hero";
import AboutUs from "../components/layaouts/AboutUs";
import Services from "../components/layaouts/Services";
import BestParts from "../components/layaouts/BestParts";
import ProSection from "../components/layaouts/ProSection";

const Home = () => {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <Hero />
      <AboutUs />
      <Services />
      <BestParts />
      <ProSection />
    </div>
  );
};

export default Home;
