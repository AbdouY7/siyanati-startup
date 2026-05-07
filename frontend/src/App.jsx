import "./App.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/registrationPages/Login";
import UserHome from "./pages/normalUserPages/UserHome";
import ResetPassword from "./pages/registrationPages/ResetPassword";
import Catalogues from "./pages/Catalogues";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route path="/home-user" element={<UserHome />} />
          <Route index element={<Home />} />
          <Route path="/catalogues" element={<Catalogues />} />
          <Route path="/magasins" element={<div>Magasins</div>} />
          <Route path="/professionnels" element={<div>Professionnels</div>} />
          <Route path="/diagnostic" element={<div>Diagnostic</div>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
