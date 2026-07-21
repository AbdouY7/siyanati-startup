import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiMessageSquare,
  FiHeart,
  FiClock,
  FiAward,
  FiDollarSign,
  FiX,
  FiCheck,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ProfessionalCard from "../components/uiComponents/ProfessionalCard";
import Footer from "../components/layaouts/Footer";
import {
  getProfessionalById,
  getAllProfessionals,
} from "../services/professionalService";
import useAuthStore from "../store/authStore";
import { createAppointment } from "../services/appointmentService";
import { getUserVehicles } from "../services/vehicleService";
import useFavoriteStore from "../store/useFavoriteStore";
import AuthRequiredModal from "../components/modals/AuthRequiredModal";
import ReportModal from "../components/modals/ReportModal";
import { getImageUrl } from "../utils/imageUtils";

// ─── Specialty type to label map ──────────────────────────────────────────────
const specialtyTypeLabels = {
  mechanic: "Mécanique générale",
  electrician: "Électricité automobile",
  bodywork: "Carrosserie et peinture",
  diagnostic: "Diagnostic électronique",
  other: "Services automobiles divers",
};

// ─── Image carousel ───────────────────────────────────────────────────────────
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const fallback =
    "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da1e?w=700&q=80";
  const imgs = images?.length ? images : [fallback];

  return (
    <div className="relative rounded-2xl overflow-hidden h-full min-h-[290px] bg-slate-100">
      <img
        src={imgs[idx]}
        alt="workspace"
        className="w-full h-full object-cover"
      />
      {imgs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === idx ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Specialty icon map ────────────────────────────────────────────────────────
const specialtyIcons = {
  mechanic: "🔧",
  electrician: "⚡",
  bodywork: "🚗",
  diagnostic: "📡",
  other: "🛠️",
};

// ─── Helper: map backend user data to UI-friendly shape ───────────────────────
function mapProfessional(userData) {
  const profile = userData.professional_profile || {};
  const store = profile.ProfessionalStore || {};
  return {
    id: userData.id,
    profile_id: profile.id, // ← target_id for favorites API
    full_name: profile.full_name || "Professionnel",
    specialty:
      specialtyTypeLabels[profile.specialty_type] ||
      profile.specialty_type ||
      "Autre",
    specialty_type: profile.specialty_type || "other",
    experience_years: profile.experience_years || 0,
    wilaya: profile.wilaya || "N/A",
    location_address: profile.location_address || "",
    shop_images: store.images?.map(getImageUrl) || [],
    is_available: profile.is_available !== false,
    is_frozen: profile.is_frozen || false,
    hourly_rate_dzd: Number(profile.hourly_rate_dzd) || 0,
    rating_avg: Number(profile.rating_avg) || 0,
    rating_count: profile.rating_count || 0,
    bio: profile.bio || "",
    created_at: userData.created_at || profile.created_at,
    avatar: getImageUrl(profile.avatar_url || profile.profilePicUrl || store.logo_url) || "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pro, setPro] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [sameWilaya, setSameWilaya] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // REMOVED: const [wishlist, setWishlist] = useState(false);

  // ─── Booking Modal State ───────────────────────────────────────────────────
  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // ── ADDED: Zustand favorites ───────────────────────────────────────────────
  const { checkIsFavorited, toggleFavorite, isFavorited, isToggling } =
    useFavoriteStore();
  // ──────────────────────────────────────────────────────────────────────────

  const handleOpenBooking = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (user.role !== "customer") {
      alert(
        "Seuls les clients peuvent prendre rendez-vous avec un professionnel.",
      );
      return;
    }

    try {
      const userVehicles = await getUserVehicles();
      setVehicles(userVehicles || []);
      if (userVehicles && userVehicles.length > 0) {
        const defaultVehicle =
          userVehicles.find((v) => v.is_default) || userVehicles[0];
        setSelectedVehicleId(defaultVehicle.id);
      } else {
        setSelectedVehicleId("");
      }
    } catch (err) {
      console.error("Failed to load user vehicles", err);
    }

    setServiceType(pro?.specialty || "");
    setDescription("");
    setLocationAddress("");
    setSubmitSuccess(false);
    setSubmitError("");
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!serviceType) {
      setSubmitError("Veuillez choisir un type de service.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Veuillez décrire le problème.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createAppointment({
        professional_id: pro.profile_id,
        vehicle_id: selectedVehicleId || undefined,
        service_type: serviceType,
        description,
        location_address: locationAddress || undefined,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Failed to book appointment", err);
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la prise de rendez-vous.";
      if (msg.includes("Duplicate")) {
        setSubmitError(
          "Vous avez déjà une demande en cours avec ce professionnel.",
        );
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fetch professional data ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await getProfessionalById(id);
        const mappedPro = mapProfessional(userData);
        setPro(mappedPro);

        try {
          const allData = await getAllProfessionals();
          const allMapped = (allData || [])
            .filter((p) => p.id !== id)
            .map(mapProfessional);

          const sorted = [...allMapped]
            .sort((a, b) => b.rating_avg - a.rating_avg)
            .slice(0, 5);
          setTopRated(sorted);

          const sameW = allMapped.filter((p) => p.wilaya === mappedPro.wilaya);
          setSameWilaya(sameW);
        } catch (othersErr) {
          console.error("Failed to fetch other professionals", othersErr);
        }
      } catch (err) {
        console.error("Failed to load professional", err);
        setError("Impossible de charger le profil du professionnel.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ── ADDED: Check favorite status once profile_id is known ─────────────────
  useEffect(() => {
    if (pro?.profile_id) {
      checkIsFavorited(pro.profile_id, "professional");
    }
  }, [pro?.profile_id]);
  // ──────────────────────────────────────────────────────────────────────────

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 pt-[100px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-400 text-sm">Chargement du profil...</p>
      </div>
    );
  }

  // Error state
  if (error || !pro) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 pt-[100px]">
        <p className="text-red-400 text-lg font-medium">
          {error || "Professionnel introuvable"}
        </p>
        <Link
          to="/professionnels"
          className="text-blue-600 hover:underline text-sm">
          ← Retour aux professionnels
        </Link>
      </div>
    );
  }

  // ── ADDED: Derived favorite state for this professional ───────────────────
  const proIsFav = isFavorited(pro.profile_id, "professional");
  const proToggling = isToggling(pro.profile_id, "professional");
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Blue hero ── */}
      <div className="bg-blue-700 px-6 pt-[110px] pb-20 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white flex items-center gap-1 text-sm mb-4 transition-colors w-fit">
          <FiArrowLeft size={15} /> Retour
        </button>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* Circular avatar with Initials fallback */}
          <div className="w-[100px] h-[100px] md:w-[88px] md:h-[88px] rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0 bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            {pro.avatar ? (
              <img
                src={pro.avatar}
                alt={pro.full_name}
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span>
                {pro.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>

          {/* Name / meta */}
          <div className="flex-1 min-w-0 pt-1 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-white font-black text-2xl leading-tight mb-0.5">
              {pro.full_name}
            </h1>
            <p className="text-blue-200 font-semibold text-sm mb-1">
              {specialtyIcons[pro.specialty_type]} {pro.specialty}
            </p>
            <div className="flex items-center gap-1 text-blue-200 text-sm mb-0.5">
              <FiMapPin size={12} />{" "}
              <span>{pro.location_address || pro.wilaya}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <FiCalendar size={12} />
              <span>
                Membre depuis {new Date(pro.created_at).getFullYear()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0 mt-4 md:mt-0 w-full md:w-auto">
            <button
              onClick={handleOpenBooking}
              className="flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow cursor-pointer">
              <FiCalendar size={14} /> Rendez-vous
            </button>

            {/* ── MODIFIED: Heart button now uses Zustand store ── */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                toggleFavorite(pro.profile_id, "professional");
              }}
              disabled={proToggling}
              className={`p-2 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                ${
                  proIsFav
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-white border-white text-blue-700 hover:bg-blue-50"
                }`}>
              <FiHeart size={16} fill={proIsFav ? "currentColor" : "none"} />
            </button>
            {/* Report button */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                setReportModalOpen(true);
              }}
              className="p-2 rounded-xl border-2 border-white bg-white text-red-500 hover:bg-red-50 transition-all active:scale-95"
              title="Signaler ce professionnel">
              <FiAlertTriangle size={16} />
            </button>
            {/* ─────────────────────────────────────────────────── */}
          </div>
        </div>
      </div>

      {/* ── Content (floats over hero) ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Bio card */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col relative z-10">
            <h2 className="text-blue-700 font-bold text-base mb-2">Bio :</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {pro.bio || "Aucune description disponible."}
            </p>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-5">
              <div>
                <p className="text-gray-400 font-medium">Wilaya :</p>
                <p className="text-gray-700 font-semibold mt-0.5">
                  {pro.wilaya}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">notation nombre :</p>
                <p className="text-gray-700 font-semibold mt-0.5">
                  {pro.rating_count} notation
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">
                  Années d'experience :
                </p>
                <p className="text-gray-700 font-semibold mt-0.5">
                  {pro.experience_years} ans
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Localisation :</p>
                <p className="text-gray-700 font-semibold mt-0.5 text-[11px]">
                  {pro.location_address || "Non renseignée"}
                </p>
              </div>
            </div>

            {/* Rating + availability */}
            <div className="flex gap-5 mb-5">
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  Notation du Professionnel
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-blue-700 font-black text-lg">
                    {pro.rating_avg}
                  </span>
                  <FiStar className="text-amber-400 fill-amber-400" size={15} />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  Professionnel disponibilité
                </p>
                <span
                  className={`font-semibold text-sm ${
                    pro.is_available ? "text-emerald-600" : "text-red-400"
                  }`}>
                  {pro.is_available ? "Disponible" : "Indisponible"}
                </span>
              </div>
            </div>

            {/* Hourly rate */}
            {pro.hourly_rate_dzd > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-5">
                <FiDollarSign size={14} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-blue-400 text-[10px] font-medium uppercase tracking-wider">
                    Tarif horaire
                  </p>
                  <p className="text-blue-700 font-bold text-sm">
                    {pro.hourly_rate_dzd.toLocaleString("fr-DZ")} Da / heure
                  </p>
                </div>
              </div>
            )}

            {/* Work plan */}
            <h3 className="text-blue-700 font-bold text-sm mb-1">
              Plan de travail :
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-5 flex-1">
              {pro.bio || "Aucune description disponible."}
            </p>

            <button 
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                navigate("/profile/chat");
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <FiMessageSquare size={15} /> Discussion
            </button>
          </div>

          {/* Images carousel */}
          <div className="md:col-span-2 relative z-10">
            <ImageCarousel images={pro.shop_images} />
          </div>
        </div>

        {/* ── Top rated professionals ── */}
        {topRated.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
              LES PROFESSIONELS AVEC PLUS DE NOTATION
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topRated.map((p) => (
                <ProfessionalCard
                  key={p.id}
                  id={p.id}
                  name={p.full_name}
                  specialty={p.specialty}
                  avatar={p.avatar}
                  wilaya={p.wilaya}
                  rating={p.rating_avg}
                  isAvailable={p.is_available}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Same wilaya ── */}
        {sameWilaya.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
              LES PROFESSIONELS DU MEME WILAYA
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sameWilaya.map((p) => (
                <ProfessionalCard
                  key={p.id}
                  id={p.id}
                  name={p.full_name}
                  specialty={p.specialty}
                  avatar={p.avatar}
                  wilaya={p.wilaya}
                  rating={p.rating_avg}
                  isAvailable={p.is_available}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Booking Modal ── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
              <div>
                <h3 className="font-bold text-lg">Prendre rendez-vous</h3>
                <p className="text-blue-100 text-xs mt-0.5">
                  Demande d'intervention pour {pro.full_name}
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-4 animate-bounce">
                  <FiCheck />
                </div>
                <h4 className="font-bold text-xl text-slate-800">
                  Demande envoyée !
                </h4>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">
                  Votre demande a été transmise avec succès. Le professionnel
                  l'examinera pour fixer la date, l'heure et le prix de départ.
                </p>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    navigate("/profile/appointments");
                  }}
                  className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow cursor-pointer active:scale-95">
                  Voir mes rendez-vous
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <FiAlertTriangle className="shrink-0 text-base" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Service Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type de service *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="">Sélectionnez un service</option>
                    <option value="Mécanique générale">
                      Mécanique générale
                    </option>
                    <option value="Électricité automobile">
                      Électricité automobile
                    </option>
                    <option value="Carrosserie et peinture">
                      Carrosserie et peinture
                    </option>
                    <option value="Diagnostic électronique">
                      Diagnostic électronique
                    </option>
                    <option value="Vidange et entretien">
                      Vidange et entretien
                    </option>
                    <option value="Autre / Dépannage">Autre / Dépannage</option>
                  </select>
                </div>

                {/* Vehicle Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Véhicule</span>
                    <Link
                      to="/profile/vehicules"
                      className="text-blue-600 hover:underline normal-case font-semibold">
                      + Ajouter un véhicule
                    </Link>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    {vehicles.length === 0 ? (
                      <option value="">
                        Aucun véhicule enregistré (continuer sans véhicule)
                      </option>
                    ) : (
                      <>
                        <option value="">
                          Continuer sans véhicule particulier
                        </option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.brand?.name} {v.model?.name} ({v.year}){" "}
                            {v.registration_number
                              ? `- ${v.registration_number}`
                              : ""}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adresse d'intervention (optionnel)
                  </label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Ex: Bab Ezzouar, Alger"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description du problème *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez en détail les symptômes de la panne ou le service souhaité..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all cursor-pointer">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin text-base" />
                        Envoi...
                      </>
                    ) : (
                      "Soumettre la demande"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={pro.profile_id}
        targetType="professional"
        targetName={pro.full_name}
      />
    </div>
  );
}
