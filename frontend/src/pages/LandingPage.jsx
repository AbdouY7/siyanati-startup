import React from "react";
import Header from "../components/layaouts/Header";
import { Outlet } from "react-router-dom";
// import Cards from "../components/layaouts/Cards";

const LandingPage = () => {
  return (
    <>
      <Header />

      <Outlet />
    </>
  );
};

export default LandingPage;
