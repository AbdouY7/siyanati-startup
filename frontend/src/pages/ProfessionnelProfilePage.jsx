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
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ProfessionalCard from "../components/uiComponents/ProfessionalCard";

import Footer from "../components/layaouts/Footer";
import { getProfessionalById, getAllProfessionals } from "../services/professionalService";

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
              className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-white scale-125" : "bg-white/50"}`}
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
  return {
    id: userData.id,
    full_name: profile.full_name || "Professionnel",
    specialty: specialtyTypeLabels[profile.specialty_type] || profile.specialty_type || "Autre",
    specialty_type: profile.specialty_type || "other",
    experience_years: profile.experience_years || 0,
    wilaya: profile.wilaya || "N/A",
    location_address: profile.location_address || "",
    shop_images: profile.shop_images || [],
    is_available: profile.is_available !== false,
    is_frozen: profile.is_frozen || false,
    hourly_rate_dzd: Number(profile.hourly_rate_dzd) || 0,
    rating_avg: Number(profile.rating_avg) || 0,
    rating_count: profile.rating_count || 0,
    bio: profile.bio || "",
    created_at: userData.created_at || profile.created_at,
    avatar: profile.shop_images?.[0] || "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da1e?w=300&q=80",
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
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the individual professional
        const userData = await getProfessionalById(id);
        const mappedPro = mapProfessional(userData);
        setPro(mappedPro);

        // Fetch all professionals for related sections
        try {
          const allData = await getAllProfessionals();
          const allMapped = (allData || [])
            .filter((p) => p.id !== id)
            .map(mapProfessional);

          // Top rated (sorted by rating)
          const sorted = [...allMapped].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 5);
          setTopRated(sorted);

          // Same wilaya
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-400 text-sm">Chargement du profil...</p>
      </div>
    );
  }

  // Error state
  if (error || !pro) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-red-400 text-lg font-medium">{error || "Professionnel introuvable"}</p>
        <Link to="/professionnels" className="text-blue-600 hover:underline text-sm">
          ← Retour aux professionnels
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Blue hero ── */}
      <div className="bg-blue-700 px-6 pt-4 pb-20 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white flex items-center gap-1 text-sm mb-4 transition-colors w-fit">
          <FiArrowLeft size={15} /> Retour
        </button>

        <div className="max-w-6xl mx-auto flex items-start gap-5">
          {/* Circular avatar */}
          <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0">
            <img
              src={pro.avatar}
              alt={pro.full_name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Name / meta */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-white font-black text-2xl leading-tight mb-0.5">
              {pro.full_name}
            </h1>
            <p className="text-blue-200 font-semibold text-sm mb-1">
              {specialtyIcons[pro.specialty_type]} {pro.specialty}
            </p>
            <div className="flex items-center gap-1 text-blue-200 text-sm mb-0.5">
              <FiMapPin size={12} /> <span>{pro.location_address || pro.wilaya}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <FiCalendar size={12} />
              <span>
                Membre depuis {new Date(pro.created_at).getFullYear()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow">
              <FiCalendar size={14} /> Rendez-vous
            </button>
            <button
              onClick={() => setWishlist((p) => !p)}
              className={`p-2 rounded-xl border-2 transition-all active:scale-95
                ${wishlist ? "bg-red-500 border-red-500 text-white" : "bg-white border-white text-blue-700 hover:bg-blue-50"}`}>
              <FiHeart size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content (floats over hero) ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-8">
        <div className="grid grid-cols-3 gap-5 mb-10">
          {/* Bio card */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
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
                <p className="text-gray-400 font-medium">
                  Localisation :
                </p>
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
                  className={`font-semibold text-sm ${pro.is_available ? "text-emerald-600" : "text-red-400"}`}>
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

            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <FiMessageSquare size={15} /> Discussion
            </button>
          </div>

          {/* Images carousel */}
          <div className="col-span-2">
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

      <Footer />
    </div>
  );
}
