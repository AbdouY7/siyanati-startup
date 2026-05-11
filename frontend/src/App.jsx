import "./App.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/registrationPages/Login";
import UserHome from "./pages/normalUserPages/UserHome";
import ResetPassword from "./pages/registrationPages/ResetPassword";
import Catalogues from "./pages/Catalogues";
import PartDetails from "./pages/PartDetails";
import Magasins from "./pages/Magasins";
import ShopProfilePage from "./pages/ShopProfilePage";
import BuyPage from "./pages/BuyPage";
import ProfessionalProfilePage from "./pages/ProfessionnelProfilePage";
import Professionals from "./pages/Professionals";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route path="/home-user" element={<UserHome />} />
          <Route index element={<Home />} />
          <Route path="/catalogues" element={<Catalogues />} />
          <Route path="/part-details/:id" element={<PartDetails />} />
          <Route path="/Buy-part/:id" element={<BuyPage />} />
          <Route path="/magasins" element={<Magasins />} />
          <Route path="/shops/:id" element={<ShopProfilePage />} />
          <Route path="/professionnels" element={<Professionals />} />
          <Route
            path="/professionnels/:id"
            element={<ProfessionalProfilePage />}
          />
          <Route path="/diagnostic" element={<div>Diagnostic</div>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
