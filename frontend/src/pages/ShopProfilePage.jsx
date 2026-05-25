import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  FiAlertTriangle,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ShopCards from "../components/uiComponents/ShopCards";
import Footer from "../components/layaouts/Footer";
import { getStoreById, getAllStores } from "../services/storeService";
import { getAllParts } from "../services/partService";
import { createOrder } from "../services/orderService";
import useFavoriteStore from "../store/useFavoriteStore";
import useAuthStore from "../store/authStore";
import AuthRequiredModal from "../components/modals/AuthRequiredModal";
import ReportModal from "../components/modals/ReportModal";

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

function PartCard({ part, cartQty, onAddToCart }) {
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
            onClick={() => onAddToCart(part)}
            className="flex-1 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-[11px] font-semibold py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-150 relative">
            {cartQty > 0 ? `Panier (${cartQty})` : "Ajouter ＋"}
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
  const displayImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=700&q=80",
        ];
  return (
    <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px] bg-slate-100">
      <img
        src={displayImages[idx]}
        alt="shop"
        className="w-full h-full object-cover"
      />
      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displayImages.map((_, i) => (
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ShopProfilePage() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [storeParts, setStoreParts] = useState([]);
  const [otherStores, setOtherStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [partSearch, setPartSearch] = useState("");
  const [cart, setCart] = useState({});

  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // ── ADDED: Zustand favorites ───────────────────────────────────────────────
  const { checkIsFavorited, toggleFavorite, isFavorited, isToggling } =
    useFavoriteStore();
  // ──────────────────────────────────────────────────────────────────────────

  const handleAddToCart = (part) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCart((prev) => ({
      ...prev,
      [part.id]: { part, qty: (prev[part.id]?.qty || 0) + 1 },
    }));
  };

  const handleUpdateCartQty = (partId, delta) => {
    setCart((prev) => {
      const current = prev[partId]?.qty || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [partId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [partId]: { ...prev[partId], qty: next } };
    });
  };

  const goToCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (Object.keys(cart).length === 0) return;
    sessionStorage.setItem("checkout_cart", JSON.stringify(cart));
    sessionStorage.setItem("checkout_store", JSON.stringify(store));
    navigate("/buy-cart");
  };

  const cartTotalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.qty,
    0,
  );
  const cartTotalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.part.prix * item.qty,
    0,
  );

  // ── Fetch store data ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStoreData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await getStoreById(id);
        const profile = userData.store_profile || {};

        const mappedStore = {
          id: userData.id,
          store_profile_id: profile.id, // ← target_id for favorites API
          owner_name: profile.owner_name || "Propriétaire",
          store_name: profile.store_name || "Magasin",
          description: profile.description || "",
          address: profile.address || "",
          wilaya: profile.wilaya || "N/A",
          images: profile.images || [],
          logo_url: profile.logo_url || "",
          verified: profile.status === "approved",
          rating_avg: Number(profile.rating_avg) || 0,
          rating_count: profile.rating_count || 0,
          created_at: userData.created_at,
        };
        setStore(mappedStore);

        try {
          const allParts = await getAllParts();
          const storePartsList = (allParts || []).filter(
            (p) => p.seller_id === id,
          );
          const mappedParts = storePartsList.map((p) => {
            const comp = p.compatibilities?.[0];
            return {
              id: p.id,
              name: p.name,
              categorie: p.category?.name || "Général",
              vehicule: {
                marque: comp?.brand?.name || "Universel",
                modele: comp?.model?.name || "",
                annee: comp?.year_from || "N/A",
                carburant: comp?.engine_variant || "N/A",
              },
              etat: p.condition === "new" ? "Neuf" : "Occasion",
              disponibilite: p.stock_qty > 0 ? "En stock" : "Indisponible",
              prix: Number(p.price_dzd),
              image: p.images?.[0] || "/placeholder-part.png",
            };
          });
          setStoreParts(mappedParts);
        } catch (partsErr) {
          console.error("Failed to fetch store parts", partsErr);
        }

        try {
          const allStores = await getAllStores();
          const others = (allStores || [])
            .filter((s) => {
              const sp = s.store_profile || {};
              return sp.wilaya === mappedStore.wilaya && s.id !== id;
            })
            .map((s) => {
              const sp = s.store_profile || {};
              return {
                id: s.id,
                store_name: sp.store_name || "Magasin",
                owner_name: sp.owner_name || "Propriétaire",
                wilaya: sp.wilaya || "N/A",
                images: sp.images || [],
                logo_url: sp.logo_url || "",
                rating_avg: Number(sp.rating_avg) || 0,
              };
            });
          setOtherStores(others);
        } catch (othersErr) {
          console.error("Failed to fetch other stores", othersErr);
        }
      } catch (err) {
        console.error("Failed to load store", err);
        setError("Impossible de charger les informations du magasin.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id]);

  // ── ADDED: Check favorite status once store_profile_id is known ────────────
  useEffect(() => {
    if (store?.store_profile_id) {
      checkIsFavorited(store.store_profile_id, "store");
    }
  }, [store?.store_profile_id]);
  // ──────────────────────────────────────────────────────────────────────────

  const filteredParts = storeParts.filter(
    (p) =>
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.categorie.toLowerCase().includes(partSearch.toLowerCase()),
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 pt-[100px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-400 text-sm">Chargement du magasin...</p>
      </div>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 pt-[100px]">
        <p className="text-red-400 text-lg font-medium">
          {error || "Magasin introuvable"}
        </p>
        <Link to="/magasins" className="text-blue-600 hover:underline text-sm">
          ← Retour aux magasins
        </Link>
      </div>
    );
  }

  // ── Derived favorite state for this store ─────────────────────────────────
  const storeIsFav = isFavorited(store.store_profile_id, "store");
  const storeToggling = isToggling(store.store_profile_id, "store");
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Blue hero header */}
      <div className="bg-blue-700 px-6 pt-[110px] pb-20 relative">
        <Link
          to="/magasins"
          className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 no-underline w-fit">
          <FiArrowLeft size={16} /> Retour
        </Link>

        <div className="max-w-6xl mx-auto flex items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0 bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {store.store_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
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
            <button
              onClick={goToCheckout}
              className="relative flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow">
              <FiShoppingCart size={14} /> Pannier de commande
              {cartTotalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* ── MODIFIED: Heart button now uses Zustand store ── */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                toggleFavorite(store.store_profile_id, "store");
              }}
              disabled={storeToggling}
              className={`p-2 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                ${
                  storeIsFav
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-white border-white text-blue-700 hover:bg-blue-50"
                }`}>
              <FiHeart size={16} fill={storeIsFav ? "currentColor" : "none"} />
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
              title="Signaler ce magasin">
              <FiAlertTriangle size={16} />
            </button>
            {/* ─────────────────────────────────────────────────── */}
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
              {store.description || "Aucune description disponible."}
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
                  Localisation du magasin :
                </p>
                <p className="text-gray-700 font-semibold text-[11px]">
                  {store.address || "Non renseignée"}
                </p>
              </div>
            </div>

            {/* Rating */}
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
            </div>

            <h3 className="text-blue-700 font-bold text-sm mb-1">
              Plan de travail :
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-4">
              {store.description || "Aucune description disponible."}
            </p>

            <button 
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                // Handle discussion click
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              <FiMessageSquare size={15} /> Discussion
            </button>
          </div>

          {/* Image carousel */}
          <div className="col-span-2">
            <ImageCarousel images={store.images} />
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
                placeholder="Rechercher une pièce..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all">
              <FiSearch size={16} />
            </button>
            <button
              onClick={goToCheckout}
              className="relative p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 active:scale-95 transition-all">
              <FiShoppingCart size={16} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartTotalItems}
                </span>
              )}
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
          {filteredParts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Aucune pièce trouvée dans ce magasin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredParts.map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  cartQty={cart[part.id]?.qty || 0}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
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
                  image={
                    s.images[0] ||
                    s.logo_url ||
                    "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&q=80"
                  }
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
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={store.store_profile_id}
        targetType="store"
        targetName={store.store_name}
      />
    </div>
  );
}
