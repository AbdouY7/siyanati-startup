import React, { useState, useMemo } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import DropDownList from "../components/uiComponents/DropDownList";
import Part from "../components/uiComponents/Part";
import parts from "../../data/parts";

// ─── Filter config ────────────────────────────────────────────────────────────
const filters = [
  {
    name: "Type de pièce",
    key: "partType",
    options: [
      "Moteur",
      "Boîte de vitesse",
      "Freinage",
      "Suspension",
      "Électricité",
      "Carrosserie",
    ],
    match: (part, val) => part.categorie === val,
  },
  {
    name: "Marque du véhicule",
    key: "brand",
    options: ["Toyota", "Peugeot", "Renault", "Volkswagen", "Hyundai", "Ford"],
    match: (part, val) => part.vehicule?.marque === val,
  },
  {
    name: "Modèle du véhicule",
    key: "model",
    options: ["Corolla", "Clio", "Golf", "Polo", "Accent", "Focus"],
    match: (part, val) => part.vehicule?.modele === val,
  },
  {
    name: "Année / Génération",
    key: "year",
    options: ["2015–2017", "2018–2020", "2021–2023", "2024+"],
    match: (part, val) => {
      const y = part.vehicule?.annee;
      if (!y) return false;
      if (val === "2015–2017") return y >= 2015 && y <= 2017;
      if (val === "2018–2020") return y >= 2018 && y <= 2020;
      if (val === "2021–2023") return y >= 2021 && y <= 2023;
      if (val === "2024+") return y >= 2024;
      return false;
    },
  },
  {
    name: "État de la pièce",
    key: "condition",
    options: ["Neuf", "Occasion", "Reconditionné"],
    match: (part, val) => part.etat === val,
  },
  {
    name: "Disponibilité",
    key: "availability",
    options: ["En stock", "Sur commande", "Indisponible"],
    match: (part, val) => part.disponibilite === val,
  },
  {
    name: "Type de moteur",
    key: "engineType",
    options: ["Essence", "Diesel", "Hybride", "Électrique"],
    match: (part, val) => part.vehicule?.carburant === val,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const Catalogues = () => {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(
    Object.fromEntries(filters.map((f) => [f.key, ""])),
  );

  const setFilter = (key, val) =>
    setActiveFilters((prev) => ({ ...prev, [key]: val }));

  const resetAll = () => {
    setSearch("");
    setActiveFilters(Object.fromEntries(filters.map((f) => [f.key, ""])));
  };

  const anyActive =
    search.trim() !== "" || Object.values(activeFilters).some((v) => v !== "");

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          part.name?.toLowerCase().includes(q) ||
          part.categorie?.toLowerCase().includes(q) ||
          part.boutique?.toLowerCase().includes(q) ||
          part.vehicule?.marque?.toLowerCase().includes(q) ||
          part.vehicule?.modele?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      // Filter match
      for (const f of filters) {
        const val = activeFilters[f.key];
        if (val && !f.match(part, val)) return false;
      }
      return true;
    });
  }, [search, activeFilters]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-1.5">
            Catalogues
          </h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            Vous ne pouvez pas commander plusieurs pièces provenant de magasins
            différents dans une seule commande. Vous devrez passer une commande
            séparée pour chaque pièce.
          </p>
        </div>

        {/* Search row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full max-w-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <IoSearchOutline className="text-gray-400 shrink-0" size={17} />
            <input
              type="text"
              placeholder="Rechercher une pièce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-2.5 rounded-xl transition-all duration-150 shadow-sm">
            <IoSearchOutline size={18} />
          </button>
          <button
            onClick={resetAll}
            title="Réinitialiser les filtres"
            className={` p-2.5 rounded-xl transition-all duration-150 active:scale-95
              ${
                anyActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }`}>
            <FiFilter size={16} />
          </button>
        </div>

        {/* Filter pills row */}

        <div className="flex  items-center gap-2 mb-8 flex-wrap">
          {filters.map((filter) => (
            <DropDownList
              key={filter.key}
              name={filter.key}
              placeholder={filter.name}
              options={filter.options.map((o) => ({ value: o, label: o }))}
              value={activeFilters[filter.key]}
              onChange={(val) => setFilter(filter.key, val)}
            />
          ))}

          {/* Reset / filter button */}
          {/* <button
              onClick={resetAll}
              title="Réinitialiser les filtres"
              className={`ml-auto p-2 rounded-lg transition-all duration-150 active:scale-95
              ${
                anyActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }`}>
              <FiFilter size={16} />
            </button> */}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 mb-4">
          {filteredParts.length} pièce{filteredParts.length !== 1 ? "s" : ""}{" "}
          trouvée{filteredParts.length !== 1 ? "s" : ""}
          {anyActive && (
            <button
              onClick={resetAll}
              className=" text-blue-500 hover:text-blue-700 underline transition-colors">
              Effacer les filtres
            </button>
          )}
        </p>

        {/* Parts grid */}
        {filteredParts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredParts.map((part, index) => (
              <Part key={index} part={part} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">Aucune pièce trouvée</p>
            <p className="text-sm mt-1">
              Modifiez vos filtres ou votre recherche
            </p>
            <button
              onClick={resetAll}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline transition-colors">
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogues;
