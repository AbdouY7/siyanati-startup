import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiPlus, FiChevronDown } from "react-icons/fi";
import ShopCards from "../components/uiComponents/ShopCards";
import { getAllStores } from "../services/storeService";
import { getImageUrl } from "../utils/imageUtils";

const wilayas = ["Toutes", "Sétif", "Alger", "Annaba", "Oran"];
const ratings = ["Toutes", "4.5+", "4.0+", "3.5+"];
const experiences = ["Toutes", "2+ ans", "5+ ans", "8+ ans"];
const availabilities = ["Toutes", "Disponible", "Sur commande"];

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all duration-150 font-medium
          ${
            value !== options[0]
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}>
        {label} {value !== options[0] && `· ${value}`}
        <FiChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left text-sm px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors
                ${value === opt ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-700"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Magasins() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [wilaya, setWilaya] = useState("Toutes");
  const [rating, setRating] = useState("Toutes");
  const [experience, setExperience] = useState("Toutes");
  const [availability, setAvailability] = useState("Toutes");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getAllStores();
        // Map backend response to the shape the UI expects
        const mappedStores = (data || []).map((s) => {
          const profile = s.store_profile || {};
          return {
            id: s.id,
            user_id: s.id,
            owner_name: profile.owner_name || "Propriétaire",
            store_name: profile.store_name || "Magasin",
            description: profile.description || "",
            address: profile.address || "",
            wilaya: profile.wilaya || "N/A",
            images: profile.images?.map(getImageUrl) || [],
            logo_url: getImageUrl(profile.logo_url) || "",
            verified: profile.status === "approved",
            rating_avg: Number(profile.rating_avg) || 0,
            rating_count: profile.rating_count || 0,
            is_frozen: profile.is_frozen || false,
            created_at: s.created_at || profile.created_at,
          };
        });
        setStores(mappedStores);
      } catch (err) {
        console.error("Failed to load stores", err);
        setError("Impossible de charger les magasins.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchWilaya = wilaya === "Toutes" || s.wilaya === wilaya;
    const matchRating =
      rating === "Toutes" ||
      (rating === "4.5+" && s.rating_avg >= 4.5) ||
      (rating === "4.0+" && s.rating_avg >= 4.0) ||
      (rating === "3.5+" && s.rating_avg >= 3.5);
    const matchAvail = availability === "Toutes";
    return matchSearch && matchWilaya && matchRating && matchAvail;
  });

  const anyActive =
    search.trim() !== "" ||
    wilaya !== "Toutes" ||
    rating !== "Toutes" ||
    experience !== "Toutes" ||
    availability !== "Toutes";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full max-w-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <FiSearch className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="rechercher les magasins ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-2.5 rounded-xl transition-all duration-150 shadow-sm">
            <FiSearch size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <FilterDropdown
            label="Wilaya"
            options={wilayas}
            value={wilaya}
            onChange={setWilaya}
          />
          <FilterDropdown
            label="Note minimale"
            options={ratings}
            value={rating}
            onChange={setRating}
          />
          <FilterDropdown
            label="Années d'expérience"
            options={experiences}
            value={experience}
            onChange={setExperience}
          />
          <FilterDropdown
            label="Disponibilité"
            options={availabilities}
            value={availability}
            onChange={setAvailability}
          />
          <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 transition-all">
            Localisation du vendeur <FiChevronDown size={14} />
          </button>
          <button
            onClick={() => {
              setSearch("");
              setWilaya("Toutes");
              setRating("Toutes");
              setExperience("Toutes");
              setAvailability("Toutes");
            }}
            title="Réinitialiser les filtres"
            className={`ml-auto p-2.5 rounded-xl transition-all duration-150 active:scale-95
              ${
                anyActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }`}>
            <FiFilter size={16} />
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-400 text-sm">Chargement des magasins...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="text-center py-24 text-red-400">
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm mt-1">
              Veuillez vous connecter et réessayer.
            </p>
          </div>
        )}

        {/* Shop grid */}
        {!isLoading && !error && filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">Aucun magasin trouvé</p>
            <p className="text-sm mt-1">
              Modifiez vos filtres pour voir plus de résultats
            </p>
          </div>
        ) : (
          !isLoading &&
          !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((store) => (
                <ShopCards
                  key={store.id}
                  id={store.id}
                  name={store.store_name}
                  image={
                    getImageUrl(store.images[0] || store.logo_url) ||
                    "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&q=80"
                  }
                  owner={store.owner_name}
                  wilaya={store.wilaya}
                  rating={store.rating_avg}
                  available={!store.is_frozen}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
