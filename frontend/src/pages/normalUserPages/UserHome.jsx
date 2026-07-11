import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiRepeat,
  FiX,
  FiCheck,
  FiMapPin,
  FiTool,
  FiPackage,
  FiUsers,
  FiMessageSquare,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

import ProfessionalCard from "../../components/uiComponents/ProfessionalCard";
import ShopCards from "../../components/uiComponents/ShopCards";
import PartCard from "../../components/uiComponents/PartCard";
import DiagnosticPostCard from "../../components/uiComponents/DiagnosticPostCard";
import Footer from "../../components/layaouts/Footer";

import useAuthStore from "../../store/authStore";
import { getAllStores } from "../../services/storeService";
import { getAllProfessionals } from "../../services/professionalService";
import { getAllParts } from "../../services/partService";
import { getUserVehicles } from "../../services/vehicleService";
import { getDiagnosticPosts } from "../../services/diagnosticService";
import { getImageUrl } from "../../utils/imageUtils";

import heroBg from "../../assets/img/Home-user-Hero.png";

// ─── Specialty label map ──────────────────────────────────────────────────────
const specialtyLabels = {
  mechanic: "Mécanique générale",
  electrician: "Électricité automobile",
  bodywork: "Carrosserie et peinture",
  diagnostic: "Diagnostic électronique",
  other: "Services automobiles divers",
};

// ─── Horizontal scroll section ────────────────────────────────────────────────
function ScrollSection({ title, viewAllTo, viewAllLabel, children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current)
      ref.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
            {viewAllLabel} <FiChevronRight size={15} />
          </Link>
        )}
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <FiChevronLeft size={16} />
        </button>

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {children}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <FiChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

// ─── Car Switcher Modal ───────────────────────────────────────────────────────
function CarSwitcherModal({ cars, activeCar, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm z-10"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">
            Changer de véhicule
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <FiX size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {cars.map((car) => (
            <button
              key={car.id}
              onClick={() => {
                onSelect(car);
                onClose();
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 text-left
                ${
                  activeCar?.id === car.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                }`}>
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={car.image}
                  alt={car.model}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {car.brand} {car.model}
                </p>
                <p className="text-[11px] text-gray-400">
                  {car.year} · {car.fuel}
                </p>
              </div>
              {activeCar?.id === car.id && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <FiCheck size={11} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Link
          to="/add-car"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[13px] font-semibold text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all">
          + Ajouter un véhicule
        </Link>
      </div>
    </div>
  );
}

// ─── UserHome Page ────────────────────────────────────────────────────────────
export default function UserHome() {
  const { user } = useAuthStore();

  // Derive user info from auth store
  const userProfile =
    user?.client_profile ||
    user?.store_profile ||
    user?.professional_profile ||
    {};
  const userName =
    userProfile.full_name ||
    userProfile.owner_name ||
    userProfile.store_name ||
    "Utilisateur";
  const userWilaya = userProfile.wilaya || "N/A";

  // State for data from APIs
  const [userCars, setUserCars] = useState([]);
  const [activeCar, setActiveCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [search, setSearch] = useState("");

  const [topShops, setTopShops] = useState([]);
  const [topPros, setTopPros] = useState([]);
  const [featuredParts, setFeaturedParts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [regionShops, setRegionShops] = useState([]);
  const [regionPros, setRegionPros] = useState([]);
  const [stats, setStats] = useState({
    questions: 0,
    responses: 0,
    prosCount: 0,
  });

  useEffect(() => {
    // Fetch user vehicles
    getUserVehicles()
      .then((data) => {
        const mapped = (data || []).map((v) => ({
          id: v.id,
          brand: v.brand?.name || "Véhicule",
          model: v.model?.name || "",
          year: v.year,
          fuel: v.fuel_type || "N/A",
          image: getImageUrl(
            v.vehicule_picture_url ||
            v.image_url
          ) || "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300&q=80",
        }));
        setUserCars(mapped);
        if (mapped.length > 0) setActiveCar(mapped[0]);
      })
      .catch(() => {});

    // Fetch stores
    getAllStores()
      .then((data) => {
        const mapped = (data || []).map((s) => {
          const sp = s.store_profile || {};
          return {
            id: s.id,
            store_name: sp.store_name || "Magasin",
            owner_name: sp.owner_name || "Propriétaire",
            wilaya: sp.wilaya || "N/A",
            images: (sp.images || []).map(getImageUrl),
            logo_url: getImageUrl(sp.logo_url) || "",
            rating_avg: Number(sp.rating_avg) || 0,
            verified: sp.status === "approved",
            is_frozen: sp.is_frozen || false,
          };
        });
        const sorted = [...mapped].sort((a, b) => b.rating_avg - a.rating_avg);
        setTopShops(sorted.slice(0, 5));
        setRegionShops(
          sorted.filter((s) => s.wilaya === userWilaya).slice(0, 5),
        );
      })
      .catch(() => {});

    // Fetch professionals
    getAllProfessionals()
      .then((data) => {
        const mapped = (data || []).map((p) => {
          const pp = p.professional_profile || {};
          return {
            id: p.id,
            full_name: pp.full_name || "Professionnel",
            specialty:
              specialtyLabels[pp.specialty_type] ||
              pp.specialty_type ||
              "Autre",
            wilaya: pp.wilaya || "N/A",
            rating_avg: Number(pp.rating_avg) || 0,
            is_available: pp.is_available !== false,
            avatar: getImageUrl(pp.avatar_url || pp.ProfessionalStore?.logo_url || pp.ProfessionalStore?.images?.[0]) ||
              "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da1e?w=300&q=80",
          };
        });
        const sorted = [...mapped].sort((a, b) => b.rating_avg - a.rating_avg);
        setTopPros(sorted.slice(0, 5));
        const regional = sorted
          .filter((p) => p.wilaya === userWilaya)
          .slice(0, 5);
        setRegionPros(regional);
        setStats((prev) => ({ ...prev, prosCount: regional.length }));
      })
      .catch(() => {});

    // Fetch parts
    getAllParts()
      .then((data) => {
        const mapped = (data || []).slice(0, 6).map((p) => {
          const comp = p.compatibilities?.[0];
          return {
            id: p.id,
            title: p.name,
            details: `${comp?.brand?.name || "Universel"} ${comp?.model?.name || ""} · ${comp?.year_from || ""}`,
            description: p.description || "",
            price: Number(p.price_dzd),
            status: 4,
            image: getImageUrl(p.images?.[0]) || null,
          };
        });
        setFeaturedParts(mapped);
      })
      .catch(() => {});

    // Fetch diagnostic posts
    getDiagnosticPosts({ limit: 3 })
      .then((data) => {
        const posts = data?.posts || [];
        const mapped = posts.map((p) => {
          const a = p.author || {};
          const name =
            a.client_profile?.full_name ||
            a.professional_profile?.full_name ||
            a.store_profile?.store_name ||
            a.full_name ||
            a.name ||
            a.username ||
            "Utilisateur";
          const avatar = getImageUrl(
            a.client_profile?.avatar_url ||
            a.client_profile?.profilePicUrl ||
            a.professional_profile?.avatar_url ||
            a.store_profile?.logo_url ||
            a.avatar_url
          ) || "/default-avatar.png";
          const wilaya =
            a.client_profile?.wilaya ||
            a.professional_profile?.wilaya ||
            a.store_profile?.wilaya ||
            "N/A";

          return {
            id: p.id,
            posted_at: new Date(p.created_at).toLocaleDateString("fr-FR"),
            user: {
              full_name: name,
              profile_picture: avatar,
              wilaya: wilaya,
            },
            title: p.title,
            car: {
              brand: p.brand?.name || p.vehicle?.brand?.name || "N/A",
              model: p.model?.name || p.vehicle?.model?.name || "",
              year: p.year || p.vehicle?.year || "",
              engine: p.fuel_type || p.vehicle?.fuel_type || "",
            },
            car_images: (p.images || []).map(getImageUrl),
            tags: [],
            description: p.description || "",
            saves_count: p.saves_count || p._count?.savedBy || 0,
            comments_count: p.comments_count || p._count?.comments || 0,
          };
        });
        setRecentPosts(mapped);
        setStats((prev) => ({ ...prev, questions: data?.total || 0 }));
      })
      .catch(() => {});
  }, [userWilaya]);

  const computedStats = [
    {
      icon: FiMessageSquare,
      label: "Questions posées",
      value: String(stats.questions),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: FiUsers,
      label: "Magasins",
      value: String(topShops.length),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: FiTool,
      label: `Pros à ${userWilaya}`,
      value: String(stats.prosCount),
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* ══════════════════════════════ HERO ══════════════════════════════════ */}
      <div
        className="relative overflow-hidden px-6 pt-[120px] pb-32"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(5,15,60,0.97) 25%, rgba(8,18,70,0.80) 55%, rgba(10,20,80,0.30) 100%), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom right",
        }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Left: greeting + search */}
            <div className="flex-1">
              <p className="text-blue-300 text-xs font-semibold mb-2 tracking-[0.2em] uppercase">
                Bienvenue de retour
              </p>
              <h1 className="text-white font-black text-4xl md:text-5xl leading-tight mb-2 tracking-tight drop-shadow-lg">
                {userName.split(" ")[0]}{" "}
                <span className="text-blue-300">
                  {userName.split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <div className="flex items-center gap-1.5 text-blue-300/80 text-sm mb-7">
                <FiMapPin size={13} />
                <span className="font-medium">{userWilaya}</span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 max-w-md focus-within:bg-white/15 focus-within:border-white/35 transition-all duration-200 shadow-lg">
                <FiSearch className="text-white/50 shrink-0" size={17} />
                <input
                  type="text"
                  placeholder="Rechercher pièces, magasins, professionnels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40 font-medium"
                />
              </div>
            </div>

            {/* Right: car card */}
            <div className="shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 min-w-[260px] shadow-xl shadow-black/20">
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5">
                  <FaCar size={10} /> Mon véhicule
                </p>
                {activeCar ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-13 rounded-xl overflow-hidden bg-white/10 shrink-0 shadow-md">
                        <img
                          src={activeCar.image}
                          alt={activeCar.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-black text-xl leading-tight tracking-tight">
                          {activeCar.brand} {activeCar.model}
                        </p>
                        <p className="text-blue-300/80 text-xs mt-0.5 font-medium">
                          {activeCar.year} · {activeCar.fuel}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCarModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 text-xs font-bold py-2.5 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all duration-150 shadow-sm">
                      <FiRepeat size={12} /> Changer véhicule
                    </button>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-blue-200/70 text-xs mb-3">
                      Aucun véhicule enregistré
                    </p>
                    <Link
                      to="/add-car"
                      className="text-white text-xs font-semibold bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors border border-white/10">
                      + Ajouter un véhicule
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ STATS ═════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 mb-10 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {computedStats.map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={color} size={18} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">
                  {value}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════ CONTENT ═══════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        {/* ── Top Shops ── */}
        <ScrollSection
          title="LES MEILLEURS MAGASINS DE PIÈCES"
          viewAllTo="/magasins"
          viewAllLabel="Voir tous les magasins">
          {topShops.length === 0 ? (
            <p className="text-sm text-gray-400 py-8">
              Aucun magasin disponible.
            </p>
          ) : (
            topShops.map((store) => (
              <div key={store.id} className="shrink-0 w-[200px]">
                <ShopCards
                  id={store.id}
                  name={store.store_name}
                  image={
                    store.images?.[0] || store.logo_url ||
                    "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&q=80"
                  }
                  owner={store.owner_name}
                  wilaya={store.wilaya}
                  rating={store.rating_avg}
                  available={!store.is_frozen}
                />
              </div>
            ))
          )}
        </ScrollSection>

        {/* ── Top Professionals ── */}
        <ScrollSection
          title="LES MEILLEURS PROFESSIONNELS"
          viewAllTo="/professionnels"
          viewAllLabel="Voir tous les professionnels">
          {topPros.length === 0 ? (
            <p className="text-sm text-gray-400 py-8">
              Aucun professionnel disponible.
            </p>
          ) : (
            topPros.map((p) => (
              <div key={p.id} className="shrink-0 w-[180px]">
                <ProfessionalCard
                  id={p.id}
                  name={p.full_name}
                  specialty={p.specialty}
                  avatar={p.avatar}
                  wilaya={p.wilaya}
                  rating={p.rating_avg}
                  isAvailable={p.is_available}
                />
              </div>
            ))
          )}
        </ScrollSection>

        {/* ── Featured Parts ── */}
        <ScrollSection
          title="PIÈCES EN VEDETTE"
          viewAllTo="/catalogues"
          viewAllLabel="Voir plus de pièces">
          {featuredParts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8">
              Aucune pièce disponible.
            </p>
          ) : (
            featuredParts.map((part) => (
              <div key={part.id} className="shrink-0 w-[210px]">
                <PartCard
                  title={part.title}
                  details={part.details}
                  description={part.description}
                  price={part.price}
                  status={part.status}
                  isConnected={true}
                  image={part.image}
                />
              </div>
            ))
          )}
        </ScrollSection>

        {/* ── Recent Posts ── */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              ARTICLES RÉCENTS
            </h2>
            <Link
              to="/diagnostic"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Aller au page des articles <FiChevronRight size={15} />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8">Aucun article récent.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentPosts.map((post) => (
                <DiagnosticPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* ── Regional Section ── */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-7 rounded-full bg-blue-600" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              MAGASINS ET PROFESSIONNELS DE{" "}
              <span className="text-blue-600">VOTRE RÉGION</span>
            </h2>
          </div>

          {/* Regional shops */}
          {regionShops.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <FiPackage size={16} className="text-blue-500" />
                  Magasins à {userWilaya}
                </h3>
                <Link
                  to="/magasins"
                  className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5">
                  Voir les magasins <FiChevronRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {regionShops.map((store) => (
                  <ShopCards
                    key={store.id}
                    id={store.id}
                    name={store.store_name}
                    image={
                      store.images?.[0] || store.logo_url ||
                      "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&q=80"
                    }
                    owner={store.owner_name}
                    wilaya={store.wilaya}
                    rating={store.rating_avg}
                    available={!store.is_frozen}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-8">
              Aucun magasin trouvé dans votre région.
            </p>
          )}

          {/* Regional professionals */}
          {regionPros.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <FiTool size={16} className="text-blue-500" />
                  Professionnels à {userWilaya}
                </h3>
                <Link
                  to="/professionnels"
                  className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5">
                  Voir les voisins <FiChevronRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {regionPros.map((p) => (
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
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Aucun professionnel trouvé dans votre région.
            </p>
          )}
        </section>
      </div>

      <Footer />

      {/* Car switcher modal */}
      {showCarModal && (
        <CarSwitcherModal
          cars={userCars}
          activeCar={activeCar}
          onSelect={setActiveCar}
          onClose={() => setShowCarModal(false)}
        />
      )}
    </div>
  );
}
