import React from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getYear } from "../../utils/dateUtils";
import Header from "../../components/layaouts/Header";
import { FiEdit2, FiSettings, FiLogOut, FiMapPin } from "react-icons/fi";

const ProfilePage = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const profile = user?.client_profile || {};

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-font-primary">
      {/* ─── Top Header Section (fixed across all profile sub-pages) ─── */}
      <div className="bg-primary-dark pt-28 pb-16 px-4 md:px-8 lg:px-16 relative">
        <Header />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex items-center justify-center">
                {profile.profilePicUrl || profile.avatar_url ? (
                  <img
                    src={profile.profilePicUrl || profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400 font-bold uppercase">
                    {profile.full_name?.charAt(0) || user.email.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center md:items-start text-white mb-2">
              <h1 className="text-2xl md:text-3xl font-bold font-font-secondary">
                {profile.full_name || "Utilisateur"}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                <FiMapPin size={16} />
                <span>{profile.wilaya || "Wilaya non définie"}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">
                Membre depuis {getYear(user.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
            <Link
              to="/profile/edit"
              className="bg-white text-secondary hover:bg-gray-50 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-sm text-sm">
              modifier le profil <FiEdit2 size={16} />
            </Link>
            <button className="bg-white/10 text-white hover:bg-white/20 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm">
              Paramètre <FiSettings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
              title="Se déconnecter">
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Sub-page content renders here ────────────────────────────── */}
      <Outlet />
    </div>
  );
};

export default ProfilePage;
