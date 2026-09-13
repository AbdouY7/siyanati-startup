import React from "react";
import Header from "../components/layaouts/Header";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import HomePro from "./ProfessionnelDashboard/HomePro";

const LandingPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (user?.role === "professional") {
    if (location.pathname === "/") {
      return <Navigate to="/pro" replace />;
    }
    return <HomePro />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default LandingPage;
