import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getYear } from "../../utils/dateUtils";
import { updateUserProfile } from "../../services/userService";
import Header from "../../components/layaouts/Header";
import { FiMapPin, FiArrowLeft, FiSave } from "react-icons/fi";
import Input from "../../components/uiComponents/InputField";

const EditProfilePage = () => {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const profile = user?.client_profile || {};

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    wilaya: profile.wilaya || "",
    address: profile.address || "",
    phone: user?.phone || "",
    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Assuming backend updates both user (phone) and profile (rest)
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        wilaya: formData.wilaya,
        address: formData.address,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
      });
      
      // Need to re-trigger checkAuth to get updated profile into Zustand
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-font-primary">
      {/* ─── Top Header Section (Reused) ─────────────────────────────── */}
      <div className="bg-primary-dark pt-28 pb-16 px-4 md:px-8 lg:px-16 relative">
        <Header />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
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

          <div className="flex items-center gap-3 shrink-0 mb-2">
             <Link
              to="/profile"
              className="bg-white/10 text-white hover:bg-white/20 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm"
            >
              <FiArrowLeft size={16} /> Retour au profil
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Content Form ─────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-16 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-font-secondary border-b pb-4">Modifier les informations</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nom complet</label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Votre nom complet"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Numéro de téléphone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Date de naissance</label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Wilaya</label>
                <Input
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleChange}
                  placeholder="Ex: Alger"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Adresse</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Votre adresse complète"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-70"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"} <FiSave size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
