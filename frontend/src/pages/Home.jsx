import React from "react";
import Hero from "../components/layaouts/Hero";
import AboutUs from "../components/layaouts/AboutUs";
import Services from "../components/layaouts/Services";
import BestParts from "../components/layaouts/BestParts";
import ProSection from "../components/layaouts/ProSection";
import Testimonial from "../components/layaouts/Testimonial";
import Footer from "../components/layaouts/Footer";

const Home = () => {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <Hero />
      <AboutUs />
      <Services />
      <BestParts />
      <ProSection />
      <Testimonial />
      <Footer />
    </div>
  );
};

export default Home;
