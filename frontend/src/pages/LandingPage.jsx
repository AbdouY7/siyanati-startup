import React from "react";
import Header from "../components/layaouts/Header";
import { Outlet } from "react-router-dom";

const LandingPage = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default LandingPage;
