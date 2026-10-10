import React, { useState, useMemo, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";

import Footer from "../components/layaouts/Footer";
import ProfessionalCard from "../components/uiComponents/ProfessionalCard";
import DropDownList from "../components/uiComponents/DropDownList";
import { getAllProfessionals } from "../services/professionalService";
import { getImageUrl } from "../utils/imageUtils";

// ─── Specialty type to label map ──────────────────────────────────────────────
const specialtyTypeLabels = {
  mechanic: "Mécanique générale",
  electrician: "Électricité automobile",
  bodywork: "Carrosserie et peinture",
  diagnostic: "Diagnostic électronique",
  other: "Services automobiles divers",
};

// ─── Filter config ────────────────────────────────────────────────────────────
const specialties = [
  "Toutes",
  "Mécanique générale",
  "Électricité automobile",
  "Carrosserie et peinture",
  "Diagnostic électronique",
  "Services automobiles divers",
];
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
const experiences = ["Toutes", "3+ ans", "5+ ans", "8+ ans"];
const availabilities = ["Toutes", "Disponible", "Indisponible"];

// Removed inline FilterDropdown

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("Toutes");
  const [wilaya, setWilaya] = useState("Toutes");
  const [rating, setRating] = useState("Toutes");
  const [experience, setExperience] = useState("Toutes");
  const [availability, setAvailability] = useState("Toutes");

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const data = await getAllProfessionals();
        // Map backend response to the shape the UI expects
        const mappedPros = (data || []).map((p) => {
          const profile = p.professional_profile || {};
          return {
            id: p.id,
            user_id: p.id,
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
            created_at: p.created_at || profile.created_at,
            avatar: getImageUrl(profile.avatar_url || profile.ProfessionalStore?.logo_url || profile.ProfessionalStore?.images?.[0]) || "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da1e?w=300&q=80",
          };
        });
        setProfessionals(mappedPros);
      } catch (err) {
        console.error("Failed to load professionals", err);
        setError("Impossible de charger les professionnels.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const anyActive =
    search.trim() !== "" ||
    specialty !== "Toutes" ||
    wilaya !== "Toutes" ||
    rating !== "Toutes" ||
    experience !== "Toutes" ||
    availability !== "Toutes";

  const resetAll = () => {
    setSearch("");
    setSpecialty("Toutes");
    setWilaya("Toutes");
    setRating("Toutes");
    setExperience("Toutes");
    setAvailability("Toutes");
  };

  const filtered = useMemo(
    () =>
      professionals.filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !p.full_name.toLowerCase().includes(q) &&
            !p.specialty.toLowerCase().includes(q) &&
            !p.wilaya.toLowerCase().includes(q)
          )
            return false;
        }
        if (specialty !== "Toutes" && p.specialty !== specialty) return false;
        if (wilaya !== "Toutes" && p.wilaya !== wilaya) return false;
        if (rating !== "Toutes") {
          const min = parseFloat(rating);
          if (p.rating_avg < min) return false;
        }
        if (experience !== "Toutes") {
          const min = parseInt(experience);
          if (p.experience_years < min) return false;
        }
        if (availability !== "Toutes") {
          const want = availability === "Disponible";
          if (p.is_available !== want) return false;
        }
        return true;
      }),
    [professionals, search, specialty, wilaya, rating, experience, availability],
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-1.5">
            Professionnels
          </h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            Trouvez les meilleurs professionnels pour la réparation et l'entretien 
            de votre véhicule. Filtrez par spécialité, expérience ou avis.
          </p>
        </div>

        {/* Search row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 w-full">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:max-w-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <IoSearchOutline className="text-gray-400 shrink-0" size={17} />
            <input
              type="text"
              placeholder="Rechercher des professionnels..."
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
              onClick={resetAll}
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

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <DropDownList
            name="specialty"
            placeholder="Spécialité"
            options={specialties.map(o => ({ value: o, label: o }))}
            value={specialty}
            onChange={setSpecialty}
          />
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
          {filtered.length} professionnel{filtered.length !== 1 ? "s" : ""}{" "}
          trouvé{filtered.length !== 1 ? "s" : ""}
          {anyActive && (
            <button
              onClick={resetAll}
              className="ml-2 text-blue-500 hover:text-blue-700 underline transition-colors">
              Effacer les filtres
            </button>
          )}
        </p>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-400 text-sm">Chargement des professionnels...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="text-center py-24 text-red-400">
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm mt-1">Veuillez vous connecter et réessayer.</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">Aucun professionnel trouvé</p>
            <p className="text-sm mt-1">
              Modifiez vos filtres pour voir plus de résultats
            </p>
            <button
              onClick={resetAll}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline transition-colors">
              Réinitialiser
            </button>
          </div>
        ) : (
          !isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((pro) => (
                <ProfessionalCard
                  key={pro.id}
                  id={pro.id}
                  name={pro.full_name}
                  specialty={pro.specialty}
                  avatar={pro.avatar}
                  wilaya={pro.wilaya}
                  rating={pro.rating_avg}
                  isAvailable={pro.is_available}
                />
              ))}
            </div>
          )
        )}
      </main>


    </div>
  );
}
