import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Enforce verification (exempt admins)
  if (user.role !== "admin") {
    if (!user.email_verified) {
      return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }
    if (!user.phone_verified) {
      return <Navigate to="/verify-phone" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

export default RoleRoute;
