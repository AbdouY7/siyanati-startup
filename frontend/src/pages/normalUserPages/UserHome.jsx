import React, { useState, useRef } from "react";
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
import Part from "../../components/uiComponents/PartCard";
import DiagnosticPostCard from "../../components/uiComponents/DiagnosticPostCard";
import Footer from "../../components/layaouts/Footer";

import professionalProfiles from "../../../data/professionelsList";
import diagnosticPosts from "../../../data/DiagnosticPosts";
import stores from "../../../data/shops";
import parts from "../../../data/parts";

import heroBg from "../../assets/img/home-user-hero.png";

// ─── Current user (replace with auth context later) ───────────────────────────
const currentUser = {
  full_name: "Abdelouaheb Merabet",
  wilaya: "Sétif",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};

// ─── User cars (replace with API later) ──────────────────────────────────────
const userCars = [
  {
    id: "car-1",
    brand: "Dacia",
    model: "Logan",
    year: 2021,
    fuel: "Essence",
    image:
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300&q=80",
  },
  {
    id: "car-2",
    brand: "Renault",
    model: "Clio 4",
    year: 2019,
    fuel: "Diesel",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=300&q=80",
  },
  {
    id: "car-3",
    brand: "Volkswagen",
    model: "Golf 7",
    year: 2018,
    fuel: "Essence",
    image:
      "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da1e?w=300&q=80",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  {
    icon: FiMessageSquare,
    label: "Questions posées",
    value: "3",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FiUsers,
    label: "Vos réponses",
    value: "12",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FiTool,
    label: "Pros à Sétif",
    value: "8",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

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
                  activeCar.id === car.id
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
              {activeCar.id === car.id && (
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
  const [activeCar, setActiveCar] = useState(userCars[0]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [search, setSearch] = useState("");

  // ── Derived data from real data files ────────────────────────────────────
  const topShops = [...stores]
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, 6);

  const topPros = [...professionalProfiles]
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, 8);

  const featuredParts = parts.slice(0, 6);

  const regionShops = stores
    .filter((s) => s.wilaya === currentUser.wilaya)
    .slice(0, 6);

  const regionPros = professionalProfiles
    .filter((p) => p.wilaya === currentUser.wilaya)
    .slice(0, 6);

  // avatar fallback: derive a deterministic portrait from user_id digits
  const proAvatar = (p) =>
    p.avatar ??
    `https://randomuser.me/api/portraits/men/${
      (parseInt(p.user_id?.replace(/\D/g, "").slice(0, 2) || "10") % 90) + 1
    }.jpg`;

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* ══════════════════════════════ HERO ══════════════════════════════════ */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-28"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(10,20,80,0.93) 30%, rgba(10,20,80,0.65) 60%, rgba(10,20,80,0.35) 100%), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: greeting + search */}
            <div className="flex-1">
              <p className="text-blue-200 text-sm font-medium mb-1 tracking-wide uppercase">
                Bienvenue de retour
              </p>
              <h1 className="text-white font-black text-3xl md:text-4xl leading-tight mb-1 tracking-tight">
                {currentUser.full_name.split(" ")[0]}{" "}
                <span className="text-blue-200">
                  {currentUser.full_name.split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <div className="flex items-center gap-1 text-blue-300 text-sm mb-5">
                <FiMapPin size={12} />
                <span>{currentUser.wilaya}</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 max-w-md focus-within:bg-white/15 transition-colors">
                <FiSearch className="text-white/60 shrink-0" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher pièces, magasins, professionnels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/50"
                />
              </div>
            </div>

            {/* Right: car card */}
            <div className="shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 min-w-[240px]">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <FaCar size={10} /> Mon véhicule
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-white/10 shrink-0">
                    <img
                      src={activeCar.image}
                      alt={activeCar.model}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-tight">
                      {activeCar.brand} {activeCar.model}
                    </p>
                    <p className="text-blue-200 text-[11px]">
                      {activeCar.year} · {activeCar.fuel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCarModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 bg-white text-blue-700 text-[12px] font-bold py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all">
                  <FiRepeat size={12} /> Changer véhicule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ STATS ═════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 mb-10 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
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
          {topShops.map((store) => (
            <div key={store.id} className="shrink-0 w-[200px]">
              <ShopCards
                id={store.id}
                name={store.store_name}
                image={store.images?.[0] ?? ""}
                owner={store.owner_name}
                wilaya={store.wilaya}
                rating={store.rating_avg}
                available={store.verified}
              />
            </div>
          ))}
        </ScrollSection>

        {/* ── Top Professionals ── */}
        <ScrollSection
          title="LES MEILLEURS PROFESSIONNELS"
          viewAllTo="/professionnels"
          viewAllLabel="Voir tous les professionnels">
          {topPros.map((p) => (
            <div key={p.id} className="shrink-0 w-[180px]">
              <ProfessionalCard
                id={p.id}
                name={p.full_name ?? p.specialty}
                specialty={p.specialty}
                avatar={proAvatar(p)}
                wilaya={p.wilaya}
                rating={p.rating_avg}
                isAvailable={p.is_available}
              />
            </div>
          ))}
        </ScrollSection>

        {/* ── Featured Parts ── */}
        <ScrollSection
          title="PIÈCES EN VEDETTE"
          viewAllTo="/catalogues"
          viewAllLabel="Voir plus de pièces">
          {featuredParts.map((part) => (
            <div key={part.id} className="shrink-0 w-[210px]">
              <Part part={part} />
            </div>
          ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {diagnosticPosts.slice(0, 3).map((post) => (
              <DiagnosticPostCard key={post.id} post={post} />
            ))}
          </div>
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
                  Magasins à {currentUser.wilaya}
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
                    image={store.images?.[0] ?? ""}
                    owner={store.owner_name}
                    wilaya={store.wilaya}
                    rating={store.rating_avg}
                    available={store.verified}
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
                  Professionnels à {currentUser.wilaya}
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
                    name={p.full_name ?? p.specialty}
                    specialty={p.specialty}
                    avatar={proAvatar(p)}
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
