import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { updateUserProfile } from "../../services/userService";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Input from "../../components/uiComponents/InputField";
import { getImageUrl } from "../../utils/imageUtils";

const EditProfilePage = () => {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const profile = user?.client_profile || {};

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    wilaya: profile.wilaya || "",
    address: profile.address || "",
    phone: user?.phone || "",
    date_of_birth: profile.date_of_birth
      ? new Date(profile.date_of_birth).toISOString().split("T")[0]
      : "",
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(
    getImageUrl(profile.profilePicUrl || profile.avatar_url) || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo.");
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        full_name: formData.full_name,
        wilaya: formData.wilaya,
        address: formData.address,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth
          ? new Date(formData.date_of_birth).toISOString()
          : null,
      };
      if (profilePicFile) payload.profilePicture = profilePicFile;

      await updateUserProfile(user.id, payload);

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du profil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (profilePicPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePicPreview);
      }
    };
  }, [profilePicPreview]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-0 -mt-8 relative z-10 pb-12">
      {/* ─── Retour ───────────────────────────────────────────────────── */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition">
          <FiArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* ─── Avatar change ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-400 font-bold uppercase">
                {profile.full_name?.charAt(0) || user.email.charAt(0)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition"
            title="Changer la photo">
            {/* camera icon inline to avoid extra import */}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="font-bold text-gray-800 text-base">
            {profile.full_name || "Utilisateur"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs text-primary font-medium hover:underline">
            Changer la photo de profil
          </button>
        </div>
      </div>

      {/* ─── Form ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 font-font-secondary border-b border-gray-100 pb-4">
          Modifier les informations
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Votre nom complet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="06..."
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <Input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            {/* Wilaya */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Wilaya
              </label>
              <Input
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                placeholder="Ex: Alger"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Adresse
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Votre adresse complète"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5">
              <FiArrowLeft size={15} /> Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-7 rounded-xl flex items-center gap-2 transition disabled:opacity-60 text-sm">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  Enregistrer <FiSave size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
