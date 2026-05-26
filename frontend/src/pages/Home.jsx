import React, { useState } from "react";
import Hero from "../components/layaouts/Hero";
import AboutUs from "../components/layaouts/AboutUs";
import Services from "../components/layaouts/Services";
import BestParts from "../components/layaouts/BestParts";
import ProSection from "../components/layaouts/ProSection";
import Testimonial from "../components/layaouts/Testimonial";
import Footer from "../components/layaouts/Footer";
import LandingSubscriptionPlans from "../components/layaouts/LandingSubscriptionPlans";
import LandingDiagnosticsPreview from "../components/layaouts/LandingDiagnosticsPreview";
import AuthPopupModal from "../components/uiComponents/AuthPopupModal";

const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const handleRequireAuth = (message) => {
    setAuthMessage(message);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <Hero />
      <AboutUs />
      <Services />
      <BestParts />
      <LandingSubscriptionPlans onRequireAuth={handleRequireAuth} />
      <ProSection />
      <LandingDiagnosticsPreview onRequireAuth={handleRequireAuth} />
      <Testimonial />
      <Footer />

      <AuthPopupModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={authMessage}
      />
    </div>
  );
};

export default Home;
