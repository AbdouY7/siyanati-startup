import React, { useState, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import ShopCards from "../components/uiComponents/ShopCards";
import DropDownList from "../components/uiComponents/DropDownList";
import { getAllStores } from "../services/storeService";
import { getImageUrl } from "../utils/imageUtils";

const wilayas = [
  "Toutes", "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal",
  "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair",
  "El Meniaa"
];
const ratings = ["Toutes", "4.5+", "4.0+", "3.5+"];
const experiences = ["Toutes", "2+ ans", "5+ ans", "8+ ans"];
const availabilities = ["Toutes", "Disponible", "Indisponible"];

// Removed inline FilterDropdown

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
    const matchAvail =
      availability === "Toutes" ||
      (availability === "Disponible" && !s.is_frozen) ||
      (availability === "Indisponible" && s.is_frozen);
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
        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-1.5">
            Magasins
          </h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            Trouvez les meilleures boutiques de pièces détachées près de chez vous.
            Filtrez par wilaya, expérience, ou disponibilité.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 w-full">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:max-w-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <IoSearchOutline className="text-gray-400 shrink-0" size={17} />
            <input
              type="text"
              placeholder="Rechercher des magasins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-2.5 rounded-xl transition-all duration-150 shadow-sm flex-1 sm:flex-none flex justify-center items-center">
              <IoSearchOutline size={18} />
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
              className={`p-2.5 rounded-xl transition-all duration-150 active:scale-95 flex-1 sm:flex-none flex justify-center items-center
                ${
                  anyActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                }`}>
              <FiFilter size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <DropDownList
            name="wilaya"
            placeholder="Wilaya"
            options={wilayas.map(o => ({ value: o, label: o }))}
            value={wilaya}
            onChange={setWilaya}
          />
          <DropDownList
            name="rating"
            placeholder="Note minimale"
            options={ratings.map(o => ({ value: o, label: o }))}
            value={rating}
            onChange={setRating}
          />
          <DropDownList
            name="experience"
            placeholder="Années d'expérience"
            options={experiences.map(o => ({ value: o, label: o }))}
            value={experience}
            onChange={setExperience}
          />
          <DropDownList
            name="availability"
            placeholder="Disponibilité"
            options={availabilities.map(o => ({ value: o, label: o }))}
            value={availability}
            onChange={setAvailability}
          />
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} magasin{filtered.length !== 1 ? "s" : ""}{" "}
          trouvé{filtered.length !== 1 ? "s" : ""}
          {anyActive && (
            <button
              onClick={() => {
                setSearch("");
                setWilaya("Toutes");
                setRating("Toutes");
                setExperience("Toutes");
                setAvailability("Toutes");
              }}
              className="ml-2 text-blue-500 hover:text-blue-700 underline transition-colors">
              Effacer les filtres
            </button>
          )}
        </p>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map((store) => (
                <ShopCards
                  key={store.id}
                  id={store.id}
                  name={store.store_name}
                  image={
                    store.images[0] || store.logo_url ||
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
