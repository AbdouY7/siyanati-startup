import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiShoppingCart,
  FiChevronDown,
  FiHeart,
  FiMessageSquare,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ShopCards from "../components/uiComponents/ShopCards";
import Footer from "../components/layaouts/Footer";
import stores from "../../data/shops";
import parts from "../../data/parts";

// ─── PartCard (inline, matching the provided component) ──────────────────────
function EtatBadge({ etat }) {
  return etat === "Neuf" ? (
    <span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Neuf
    </span>
  ) : (
    <span className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Occasion
    </span>
  );
}

function DispoBadge({ disponibilite }) {
  const styles = {
    "En stock": "bg-blue-100 text-blue-800",
    "Stock limité": "bg-red-100 text-red-800",
    "Sur commande": "bg-purple-100 text-purple-800",
  };
  const icons = { "En stock": "✔", "Stock limité": "⚠", "Sur commande": "📦" };
  return (
    <span
      className={`${styles[disponibilite] ?? "bg-gray-100 text-gray-700"} text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
      {icons[disponibilite]} {disponibilite}
    </span>
  );
}

function PartCard({ part }) {
  const { id, name, categorie, vehicule, etat, disponibilite, prix, image } =
    part;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-100">
      {/* Image */}
      <div className="relative flex items-center justify-center h-36 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <EtatBadge etat={etat} />
        </div>
        <div className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-slate-600 border border-slate-200">
          {categorie}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <div>
          <h2 className="font-semibold text-slate-800 text-[13px] leading-snug mb-0.5 truncate">
            {name}
          </h2>
          <p className="text-slate-400 text-[11px]">
            {vehicule.marque} {vehicule.modele} · {vehicule.annee}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-blue-700">
            {prix.toLocaleString("fr-DZ")} Da
          </span>
          <DispoBadge disponibilite={disponibilite} />
        </div>
        <div className="flex gap-1.5 mt-auto pt-1.5">
          <button
            onClick={() => {
              window.location.href = `/buy-part/${id}`;
            }}
            className="flex-1 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-[11px] font-semibold py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-150">
            Achetez <span>＋</span>
          </button>
          <button
            onClick={() => {
              window.location.href = `/part-details/${id}`;
            }}
            className="flex-1 border border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 text-slate-600 text-[11px] font-semibold py-1.5 rounded-xl transition-all duration-150">
            Voir plus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter pill ─────────────────────────────────────────────────────────────
function FilterPill({ label }) {
  return (
    <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all">
      {label} <FiChevronDown size={12} />
    </button>
  );
}

// ─── Image carousel ───────────────────────────────────────────────────────────
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px] bg-slate-100">
      <img
        src={images[idx]}
        alt="shop"
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ShopProfilePage() {
  const { id } = useParams();
  const store = stores.find((s) => s.id === id) ?? stores[0];
  const [partSearch, setPartSearch] = useState("");
  const [wishlist, setWishlist] = useState(false);

  const otherStores = stores.filter(
    (s) => s.wilaya === store.wilaya && s.id !== store.id,
  );

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.categorie.toLowerCase().includes(partSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Blue hero header */}
      <div className="bg-blue-700 px-6 pt-4 pb-20 relative">
        <Link
          to="/magasins"
          className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 no-underline w-fit">
          <FiArrowLeft size={16} /> Retour
        </Link>

        <div className="max-w-6xl mx-auto flex items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0">
            <img
              src={store.logo_url}
              alt={store.store_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-2xl leading-tight mb-1">
              {store.store_name}
            </h1>
            <div className="flex items-center gap-1.5 text-blue-200 text-sm mb-0.5">
              <MdVerified
                className={
                  store.verified ? "text-emerald-300" : "text-blue-300"
                }
              />
              <span>{store.owner_name}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm mb-0.5">
              <FiMapPin size={12} /> <span>{store.wilaya}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <FiCalendar size={12} />
              <span>
                Membre depuis {new Date(store.created_at).getFullYear()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow">
              <FiShoppingCart size={14} /> Pannier de commande
            </button>
            <button
              onClick={() => setWishlist(!wishlist)}
              className={`p-2 rounded-xl border-2 transition-all active:scale-95
                ${wishlist ? "bg-red-500 border-red-500 text-white" : "bg-white border-white text-blue-700 hover:bg-blue-50"}`}>
              <FiHeart size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content cards floating over hero */}
      <div className="max-w-6xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-3 gap-5 mb-6">
          {/* Bio card */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-blue-700 font-bold text-base mb-2">Bio :</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {store.description}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-4">
              <div>
                <p className="text-gray-400 font-medium">Wilaya :</p>
                <p className="text-gray-700 font-semibold">{store.wilaya}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">notation nombre :</p>
                <p className="text-gray-700 font-semibold">
                  {store.rating_count} notation
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">
                  Années d'experience :
                </p>
                <p className="text-gray-700 font-semibold">
                  {store.years_experience} ans
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">
                  Localisation du magasin :
                </p>
                <p className="text-gray-700 font-semibold text-[11px]">
                  {store.address}
                </p>
              </div>
            </div>

            {/* Rating & Availability */}
            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  Notation du Magasin
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-blue-700 font-bold text-base">
                    {store.rating_avg}
                  </span>
                  <FiStar className="text-amber-400 fill-amber-400" size={14} />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  Magasin disponibilité
                </p>
                <span className="text-emerald-600 font-semibold text-sm">
                  {store.availability}
                </span>
              </div>
            </div>

            <h3 className="text-blue-700 font-bold text-sm mb-1">
              Plan de travail :
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-4">
              {store.description}
            </p>

            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <FiMessageSquare size={15} /> Discussion
            </button>
          </div>

          {/* Image carousel */}
          <div className="col-span-2">
            <ImageCarousel
              images={
                store.images.length
                  ? store.images
                  : [
                      "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=700&q=80",
                    ]
              }
            />
          </div>
        </div>

        {/* Parts section */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            LES PIÈCES VENDU DANS LE MAGASIN
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Il est possible de commander plusieurs articles auprès du même
            magasin.
          </p>

          {/* Parts search + filters */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-xs focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <FiSearch size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Input field"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all">
              <FiSearch size={16} />
            </button>
            <button className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 active:scale-95 transition-all">
              <FiShoppingCart size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {[
              "Type de pièce",
              "Marque du véhicule",
              "Modèle du véhicule",
              "Année / Génération",
              "État de la pièce",
              "Disponibilité",
              "Type de moteur",
            ].map((f) => (
              <FilterPill key={f} label={f} />
            ))}
            <button className="ml-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-1.5 rounded-lg transition-all">
              <FiChevronDown size={16} />
            </button>
          </div>

          {/* Price range row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:border-blue-400 transition-all">
              🔽 Min Prix tu cherches
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:border-blue-400 transition-all">
              🔼 MaxPrix tu cherches
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
              ✓
            </button>
          </div>

          {/* Parts grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredParts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </section>

        {/* Same wilaya stores */}
        {otherStores.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
              MAGASINS DU MEME WILAYA
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherStores.map((s) => (
                <ShopCards
                  key={s.id}
                  id={s.id}
                  name={s.store_name}
                  image={s.images[0]}
                  owner={s.owner_name}
                  wilaya={s.wilaya}
                  rating={s.rating_avg}
                  available={true}
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
