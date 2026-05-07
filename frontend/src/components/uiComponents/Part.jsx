import React from "react";

// PartCard.jsx
// Usage: import PartCard from './PartCard'
// Then: <PartCard part={partObject} />

const CAT_ICONS = {
  Freinage: "🛑",
  Entretien: "🔧",
  Électricité: "⚡",
  Suspension: "🔩",
  Moteur: "⚙️",
  Refroidissement: "❄️",
  Carrosserie: "🚗",
  Éclairage: "💡",
  Transmission: "🔄",
  Électronique: "📡",
  Alimentation: "⛽",
  Échappement: "💨",
};

function EtatBadge({ etat }) {
  if (etat === "Neuf")
    return (
      <span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
        Neuf
      </span>
    );
  return (
    <span className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Occasion
    </span>
  );
}

function DispoBadge({ disponibilite }) {
  const map = {
    "En stock": "bg-blue-100 text-blue-800 ✔",
    "Stock limité": "bg-red-100 text-red-800 ⚠",
    "Sur commande": "bg-purple-100 text-purple-800 📦",
  };

  const styles = {
    "En stock": "bg-blue-100 text-blue-800",
    "Stock limité": "bg-red-100 text-red-800",
    "Sur commande": "bg-purple-100 text-purple-800",
  };

  const icons = {
    "En stock": "✔",
    "Stock limité": "⚠",
    "Sur commande": "📦",
  };

  return (
    <span
      className={`${styles[disponibilite] ?? "bg-gray-100 text-gray-700"} text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
      {icons[disponibilite]} {disponibilite}
    </span>
  );
}

export default function Part({ part }) {
  const {
    name,
    categorie,
    vehicule,
    etat,
    disponibilite,
    prix,
    boutique,
    image,
  } = part;

  return (
    <div className=" bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-100">
      {/* Image area */}
      <div className="relative flex items-center justify-center h-40 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className=" absolute top-0   h-full  w-full ">
          <img
            src={image}
            alt={categorie}
            className=" size-full transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="absolute top-3 left-3">
          <EtatBadge etat={etat} />
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-slate-600 border border-slate-200">
          {categorie}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Title + vehicle */}
        <div>
          <h2 className="font-semibold text-slate-800 text-[15px] leading-snug mb-0.5">
            {name}
          </h2>
          <p className="text-slate-400 text-xs">
            {vehicule.marque} {vehicule.modele} · {vehicule.annee} ·{" "}
            {vehicule.carburant}
          </p>
        </div>

        {/* Price + availability */}
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold text-blue-700">
            {prix.toLocaleString("fr-DZ")} Da
          </span>
          <DispoBadge disponibilite={disponibilite} />
        </div>

        {/* Shop */}
        <p className="text-slate-400 text-xs flex items-center gap-1">
          <span>🏪</span>
          {boutique}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button className="flex-1 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-all duration-150">
            Achetez <span className="text-base">＋</span>
          </button>
          <button className="flex-1 border border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 text-slate-600 text-sm font-semibold py-2 rounded-xl transition-all duration-150">
            Voir plus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Catalogue grid example ─────────────────────────────────────────────────
// Drop this in your page to render all cards:
//
// import PartCard from './PartCard';
//
// export default function Catalogue({ partList }) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
//       {partList.map((part, i) => (
//         <PartCard key={i} part={part} />
//       ))}
//     </div>
//   );
// }
