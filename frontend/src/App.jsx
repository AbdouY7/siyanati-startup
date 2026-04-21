import "./App.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route index element={<div>Home</div>} />
          <Route path="/catalogues" element={<div>Catalogues</div>} />
          <Route path="/magasins" element={<div>Magasins</div>} />
          <Route path="/professionnels" element={<div>Professionnels</div>} />
          <Route path="/diagnostic" element={<div>Diagnostic</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
