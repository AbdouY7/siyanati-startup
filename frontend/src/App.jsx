import "./App.css";
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useAuthStore from "./store/authStore";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/registrationPages/Login";
import UserHome from "./pages/normalUserPages/UserHome";
import ResetPassword from "./pages/registrationPages/ResetPassword";
import RegisterClient from "./pages/registrationPages/RegisterClient";
import Catalogues from "./pages/Catalogues";
import PartDetails from "./pages/PartDetails";
import Magasins from "./pages/Magasins";
import ShopProfilePage from "./pages/ShopProfilePage";
import BuyPage from "./pages/BuyPage";
import ProfessionalProfilePage from "./pages/ProfessionnelProfilePage";
import Professionals from "./pages/Professionals";
import ProfilePage from "./pages/normalUserPages/ProfilePage";
import EditProfilePage from "./pages/normalUserPages/EditProfilePage";
import VehiculesPage from "./pages/normalUserPages/vehiculesPage";

import DashboardHome from "./pages/adminDashboard/DashboardHome";
import AdminHome from "./pages/adminDashboard/AdminHome";
import AdminProfessionals from "./pages/adminDashboard/AdminProfessionals";
import AdminProfessionalDetails from "./pages/adminDashboard/AdminProfessionalDetails";
import AdminClients from "./pages/adminDashboard/AdminClients";
import AdminClientDetails from "./pages/adminDashboard/AdminClientDetails";
import AdminStores from "./pages/adminDashboard/AdminStores";
import AdminStoreDetails from "./pages/adminDashboard/AdminStoreDetails";
import AdminStoreParts from "./pages/adminDashboard/AdminStoreParts";
import ProfileInfoPage from "./pages/normalUserPages/ProfileInfosPage";
import PaymentAccountsPage from "./pages/normalUserPages/PaymentAcountsPage";
import OrderHistoryPage from "./pages/normalUserPages/OrderHistoryPage";
import AppointmentHistoryPage from "./pages/normalUserPages/AppointmentHistoryPage";
import AppointmentDetailsPage from "./pages/normalUserPages/AppointmentDetailsPage";
import FavoritePiecesPage from "./pages/normalUserPages/FavoritePiecesPage";
import FollowedStoresPage from "./pages/normalUserPages/FolowedStoresPage";
import SavedProfessionalsPage from "./pages/normalUserPages/SavedProfessionalsPage";
import PublicationsProblemsPage from "./pages/normalUserPages/PublicationsProblemsPage";
import SelectionScreen from "./pages/registrationPages/SelectionScreen";
import ProfessionalRegistration from "./pages/registrationPages/ProfessionalRegistration";
import StoreRegistration from "./pages/registrationPages/StoreRegistration";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";
import DashBoardPro from "./pages/ProfessionnelDashboard/DashboardPro";
import HomePro from "./pages/ProfessionnelDashboard/HomePro";
import AppointmentPro from "./pages/ProfessionnelDashboard/AppointmentPro";
import AppointmentDetailsPro from "./pages/ProfessionnelDashboard/AppointmentDetailsPro";

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          {/* Public Home & Landing */}
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

          {/* Protected Routes inside Landing Layout — Customer only */}
          <Route element={<RoleRoute allowedRoles={["customer"]} />}>
            <Route path="/home-user" element={<UserHome />} />
          </Route>
        </Route>

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterClient />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register-role" element={<SelectionScreen />} />
        <Route path="/register-pro" element={<ProfessionalRegistration />} />
        <Route path="/register-store" element={<StoreRegistration />} />

        {/* Customer Profile Routes */}
        <Route element={<RoleRoute allowedRoles={["customer"]} />}>
          <Route path="/profile" element={<ProfilePage />}>
            <Route index element={<ProfileInfoPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/vehicules" element={<VehiculesPage />} />
            <Route
              path="/profile/payment-accounts"
              element={<PaymentAccountsPage />}
            />
            <Route path="/profile/orders" element={<OrderHistoryPage />} />
            <Route
              path="/profile/appointments"
              element={<AppointmentHistoryPage />}
            />
            <Route
              path="/profile/favorite-pieces"
              element={<FavoritePiecesPage />}
            />
            <Route
              path="/profile/followed-stores"
              element={<FollowedStoresPage />}
            />
            <Route
              path="/profile/saved-professionals"
              element={<SavedProfessionalsPage />}
            />
            <Route
              path="/profile/publications"
              element={<PublicationsProblemsPage />}
            />
            <Route
              path="/profile/appointments/:id"
              element={<AppointmentDetailsPage />}
            />
          </Route>

          {/* Appointment Details Route */}

        </Route>

        {/* Professional Routes */}
        <Route element={<RoleRoute allowedRoles={["professional"]} />}>
          <Route path="/pro" element={<HomePro />}>
            <Route index element={<DashBoardPro />} />
            <Route path="appointments" element={<AppointmentPro />} />
            <Route
              path="appointments/:id"
              element={<AppointmentDetailsPro />}
            />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminHome />}>
            <Route index element={<DashboardHome />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientDetails />} />
            <Route path="professionals" element={<AdminProfessionals />} />
            <Route
              path="professionals/:id"
              element={<AdminProfessionalDetails />}
            />
            <Route path="stores" element={<AdminStores />} />
            <Route path="stores/:id" element={<AdminStoreDetails />} />
            <Route path="stores/:id/parts" element={<AdminStoreParts />} />
            <Route path="parts" element={<div>Parts Page</div>} />
            <Route path="reports" element={<div>Reports Page</div>} />
            <Route path="chat" element={<div>Chat Page</div>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
