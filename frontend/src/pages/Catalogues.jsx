import React, { useState, useMemo, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import DropDownList from "../components/uiComponents/DropDownList";
import Part from "../components/uiComponents/Part";
import { getAllParts } from "../services/partService";
import { getBrands } from "../services/vehicleService";

const Catalogues = () => {
  const [parts, setParts] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    partType: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    availability: "",
    engineType: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partsData, brandsData] = await Promise.all([
          getAllParts(),
          getBrands().catch(() => []) // fail gracefully
        ]);

        const mappedParts = (partsData || []).map((p) => {
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
            boutique: p.seller_type === "store" ? "Boutique Pro" : "Particulier",
            image: p.images?.[0] || "/placeholder-part.png",
          };
        });
        setParts(mappedParts);
        setDbBrands(brandsData || []);
      } catch (err) {
        console.error("Failed to load catalogue data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const dynamicFilters = useMemo(() => {
    // Collect brands and models from DB
    const dbBrandNames = dbBrands.map((b) => b.name);
    
    // If a brand is selected, show its specific models. Otherwise, show all available models from the DB.
    let dbModelNames = [];
    if (activeFilters.brand) {
      const selectedBrand = dbBrands.find(b => b.name === activeFilters.brand);
      if (selectedBrand && selectedBrand.models) {
        dbModelNames = selectedBrand.models.map((m) => m.name);
      }
    } else {
      dbModelNames = dbBrands.flatMap(b => (b.models || []).map(m => m.name));
    }

    // Also mix in any brands/models currently present in the parts list just in case they aren't in the DB brands list for some reason
    const partsBrandNames = parts.map(p => p.vehicule?.marque).filter(v => v && v !== "Universel");
    const partsModelNames = parts.map(p => p.vehicule?.modele).filter(v => v);

    const brandOptions = [...new Set([...dbBrandNames, ...partsBrandNames, "Toyota", "Peugeot", "Renault", "Volkswagen", "Hyundai", "Ford", "Dacia", "Kia", "Seat", "Skoda", "Mercedes-Benz", "BMW", "Audi", "Nissan", "Fiat"])].sort();
    const modelOptions = [...new Set([...dbModelNames, ...partsModelNames, "Corolla", "Yaris", "Hilux", "Clio", "Symbol", "Megane", "208", "301", "308", "Golf", "Polo", "Caddy", "Accent", "Tucson", "i10", "Picanto", "Ibiza", "Leon", "Octavia"])].sort();

    return [
      {
        name: "Type de pièce",
        key: "partType",
        options: ["Moteur", "Boîte de vitesse", "Freinage", "Suspension", "Électricité", "Carrosserie", "Général"],
        match: (part, val) => part.categorie === val,
      },
      {
        name: "Marque du véhicule",
        key: "brand",
        options: brandOptions,
        match: (part, val) => part.vehicule?.marque === val,
      },
      {
        name: "Modèle du véhicule",
        key: "model",
        options: modelOptions,
        match: (part, val) => part.vehicule?.modele === val,
      },
      {
        name: "Année / Génération",
        key: "year",
        options: ["1990–2000", "2001–2005", "2006–2010", "2011–2014", "2015–2017", "2018–2020", "2021–2023", "2024+"],
        match: (part, val) => {
          const y = part.vehicule?.annee;
          if (!y || y === "N/A") return false;
          if (val === "1990–2000") return y >= 1990 && y <= 2000;
          if (val === "2001–2005") return y >= 2001 && y <= 2005;
          if (val === "2006–2010") return y >= 2006 && y <= 2010;
          if (val === "2011–2014") return y >= 2011 && y <= 2014;
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
        options: ["En stock", "Indisponible"],
        match: (part, val) => part.disponibilite === val,
      },
      {
        name: "Type de moteur",
        key: "engineType",
        options: ["Essence", "Diesel", "Hybride", "Électrique"],
        match: (part, val) => part.vehicule?.carburant === val,
      },
    ];
  }, [parts, dbBrands, activeFilters.brand]);

  const setFilter = (key, val) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [key]: val };
      // If brand changes, clear model to prevent orphaned filters
      if (key === "brand" && val !== prev.brand) {
        next.model = "";
      }
      return next;
    });
  };

  const resetAll = () => {
    setSearch("");
    setActiveFilters({
      partType: "",
      brand: "",
      model: "",
      year: "",
      condition: "",
      availability: "",
      engineType: "",
    });
  };

  const anyActive =
    search.trim() !== "" || Object.values(activeFilters).some((v) => v !== "");

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
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
      for (const f of dynamicFilters) {
        const val = activeFilters[f.key];
        if (val && !f.match(part, val)) return false;
      }
      return true;
    });
  }, [search, activeFilters, parts, dynamicFilters]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 w-full">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:max-w-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <IoSearchOutline className="text-gray-400 shrink-0" size={17} />
            <input
              type="text"
              placeholder="Rechercher une pièce..."
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

        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {dynamicFilters.map((filter) => (
            <DropDownList
              key={filter.key}
              name={filter.key}
              placeholder={filter.name}
              options={filter.options.map((o) => ({ value: o, label: o }))}
              value={activeFilters[filter.key]}
              onChange={(val) => setFilter(filter.key, val)}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {filteredParts.length} pièce{filteredParts.length !== 1 ? "s" : ""}{" "}
          trouvée{filteredParts.length !== 1 ? "s" : ""}
          {anyActive && (
            <button
              onClick={resetAll}
              className="ml-2 text-blue-500 hover:text-blue-700 underline transition-colors">
              Effacer les filtres
            </button>
          )}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredParts.length > 0 ? (
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
