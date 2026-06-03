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
import BuyCartPage from "./pages/BuyCartPage";
import ProfessionalProfilePage from "./pages/ProfessionnelProfilePage";
import Professionals from "./pages/Professionals";
import ProfilePage from "./pages/normalUserPages/ProfilePage";
import EditProfilePage from "./pages/normalUserPages/EditProfilePage";
import VehiculesPage from "./pages/normalUserPages/vehiculesPage";
import ClientPartsPage from "./pages/normalUserPages/ClientPartsPage";
import ClientPartDetailsPage from "./pages/normalUserPages/ClientPartDetailsPage";

import DashboardHome from "./pages/adminDashboard/DashboardHome";
import AdminHome from "./pages/adminDashboard/AdminHome";
import AdminProfessionals from "./pages/adminDashboard/AdminProfessionals";
import AdminProfessionalDetails from "./pages/adminDashboard/AdminProfessionalDetails";
import AdminClients from "./pages/adminDashboard/AdminClients";
import AdminClientDetails from "./pages/adminDashboard/AdminClientDetails";
import AdminClientParts from "./pages/adminDashboard/AdminClientParts";
import AdminStores from "./pages/adminDashboard/AdminStores";
import AdminStoreDetails from "./pages/adminDashboard/AdminStoreDetails";
import AdminStoreParts from "./pages/adminDashboard/AdminStoreParts";
import AdminAllParts from "./pages/adminDashboard/AdminAllParts";
import AdminPartDetails from "./pages/adminDashboard/AdminPartDetails";
import AdminReports from "./pages/adminDashboard/AdminReports";
import AdminSubscriptionPlans from "./pages/adminDashboard/AdminSubscriptionPlans";
import AdminSubscriptions from "./pages/adminDashboard/AdminSubscriptions";
import ProfileInfoPage from "./pages/normalUserPages/ProfileInfosPage";
import PaymentAccountsPage from "./pages/normalUserPages/PaymentAcountsPage";
import OrderHistoryPage from "./pages/normalUserPages/OrderHistoryPage";
import AppointmentHistoryPage from "./pages/normalUserPages/AppointmentHistoryPage";
import AppointmentDetailsPage from "./pages/normalUserPages/AppointmentDetailsPage";
import FavoritePiecesPage from "./pages/normalUserPages/FavoritePiecesPage";
import NotificationsPage from "./pages/normalUserPages/NotificationsPage";
import FollowedStoresPage from "./pages/normalUserPages/FolowedStoresPage";
import SavedProfessionalsPage from "./pages/normalUserPages/SavedProfessionalsPage";
import PublicationsProblemsPage from "./pages/normalUserPages/PublicationsProblemsPage";
import SavedDiagnosticPostsPage from "./pages/normalUserPages/SavedDiagnosticPostsPage";
import SelectionScreen from "./pages/registrationPages/SelectionScreen";
import ProfessionalRegistration from "./pages/registrationPages/ProfessionalRegistration";
import StoreRegistration from "./pages/registrationPages/StoreRegistration";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";
import Diagnostics from "./pages/Diagnostics";
import DiagnosticPostDetails from "./pages/DiagnosticPostDetails";
import DashBoardPro from "./pages/ProfessionnelDashboard/DashboardPro";
import HomePro from "./pages/ProfessionnelDashboard/HomePro";
import AppointmentPro from "./pages/ProfessionnelDashboard/AppointmentPro";
import AppointmentDetailsPro from "./pages/ProfessionnelDashboard/AppointmentDetailsPro";
import SchedulePro from "./pages/ProfessionnelDashboard/SchedulePro";
import ProfilePro from "./pages/ProfessionnelDashboard/ProfilePro";
import NotificationsPro from "./pages/ProfessionnelDashboard/NotificationsPro";
import ReviewsPro from "./pages/ProfessionnelDashboard/ReviewsPro";
import ProSubscription from "./pages/ProfessionnelDashboard/ProSubscription";
import StoreHome from "./pages/StoreDashboard/StoreHome";
import StoreDashboard from "./pages/StoreDashboard/StoreDashboard";
import StoreSubscription from "./pages/StoreDashboard/StoreSubscription";
import StoreOrdersPage from "./pages/StoreDashboard/StoreOrdersPage";
import StorePartsPage from "./pages/StoreDashboard/StorePartsPage";
import StorePartDetailsPage from "./pages/StoreDashboard/StorePartDetailsPage";
import StoreOrderDetailsPage from "./pages/StoreDashboard/StoreOrderDetailsPage";
import ClientOrderDetailsPage from "./pages/normalUserPages/ClientOrderDetailsPage";
import StoreReviews from "./pages/StoreDashboard/ReviewsStore";
import StoreNotifications from "./pages/StoreDashboard/StoreNotifications";
import StoreProfile from "./pages/StoreDashboard/StoreProfile";
import SubscriptionPaymentPage from "./pages/SubscriptionPaymentPage";
import AppointmentPaymentPage from "./pages/normalUserPages/AppointmentPaymentPage";

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
          <Route path="/buy-cart" element={<BuyCartPage />} />
          <Route path="/magasins" element={<Magasins />} />
          <Route path="/shops/:id" element={<ShopProfilePage />} />
          <Route path="/professionnels" element={<Professionals />} />
          <Route
            path="/professionnels/:id"
            element={<ProfessionalProfilePage />}
          />
          <Route path="/diagnostic" element={<Diagnostics />} />
          <Route path="/diagnostic/:id" element={<DiagnosticPostDetails />} />

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
            <Route path="/profile/my-parts" element={<ClientPartsPage />} />
            <Route path="/profile/my-parts/:id" element={<ClientPartDetailsPage />} />
            <Route
              path="/profile/payment-accounts"
              element={<PaymentAccountsPage />}
            />
            <Route path="/profile/orders" element={<OrderHistoryPage />} />
            <Route
              path="/profile/orders/:id"
              element={<ClientOrderDetailsPage />}
            />
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
              path="/profile/notifications"
              element={<NotificationsPage />}
            />
            <Route
              path="/profile/saved-professionals"
              element={<SavedProfessionalsPage />}
            />
            {/* <Route
              path="/profile/professionals/:id"
              element={<ProfessionalProfilePage />}
            /> */}
            <Route
              path="/profile/publications"
              element={<PublicationsProblemsPage />}
            />
            <Route
              path="/profile/saved-diagnostic-posts"
              element={<SavedDiagnosticPostsPage />}
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
            <Route path="subscription" element={<ProSubscription />} />
            <Route path="appointments" element={<AppointmentPro />} />
            <Route path="schedule" element={<SchedulePro />} />
            <Route path="profile" element={<ProfilePro />} />
            <Route path="notifications" element={<NotificationsPro />} />
            <Route path="reviews" element={<ReviewsPro />} />
            <Route path="diagnostic" element={<Diagnostics />} />
            <Route path="diagnostic/:id" element={<DiagnosticPostDetails />} />
            <Route
              path="appointments/:id"
              element={<AppointmentDetailsPro />}
            />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["store"]} />}>
          <Route path="/store" element={<StoreHome />}>
            <Route index element={<StoreDashboard />} />
            <Route path="subscription" element={<StoreSubscription />} />
            <Route path="orders" element={<StoreOrdersPage />} />
            <Route path="orders/:id" element={<StoreOrderDetailsPage />} />
            <Route path="parts" element={<StorePartsPage />} />
            <Route path="parts/:id" element={<StorePartDetailsPage />} />
            <Route path="diagnostic" element={<Diagnostics />} />
            <Route path="diagnostic/:id" element={<DiagnosticPostDetails />} />
            <Route path="notifications" element={<StoreNotifications />} />
            <Route path="reviews" element={<StoreReviews />} />
            <Route path="profile" element={<StoreProfile />} />
            {/* <Route path="appointments" element={<AppointmentPro />} />
            <Route
              path="appointments/:id"
              element={<AppointmentDetailsPro />}
            /> */}
          </Route>
        </Route>

        <Route path="/subscription-payment/:ref" element={<SubscriptionPaymentPage />} />
        <Route path="/appointment-payment/:ref" element={<AppointmentPaymentPage />} />

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminHome />}>
            <Route index element={<DashboardHome />} />
            <Route
              path="subscription-plans"
              element={<AdminSubscriptionPlans />}
            />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientDetails />} />
            <Route path="clients/:id/parts" element={<AdminClientParts />} />
            <Route path="professionals" element={<AdminProfessionals />} />
            <Route
              path="professionals/:id"
              element={<AdminProfessionalDetails />}
            />
            <Route path="stores" element={<AdminStores />} />
            <Route path="stores/:id" element={<AdminStoreDetails />} />
            <Route path="stores/:id/parts" element={<AdminStoreParts />} />
            <Route path="parts" element={<AdminAllParts />} />
            <Route path="parts/:id" element={<AdminPartDetails />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="chat" element={<div>Chat Page</div>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
