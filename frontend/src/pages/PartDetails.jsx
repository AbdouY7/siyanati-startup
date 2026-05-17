"use client";

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  AlertCircle,
} from "lucide-react";
import PartCard from "../components/uiComponents/Part";
import parts from "../../data/parts"; // Sample data, replace with actual data fetching

// Sample data - replace with actual data fetching

// Sample related parts
const relatedParts = [
  {
    id: 2,
    name: "Plaquettes de frein arrière",
    categorie: "Freinage",
    vehicule: {
      marque: "Peugeot",
      modele: "Peugeot 208",
      annee: "2015 - 2019",
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 5500,
    boutique: "Auto Pièces El Amal",
    image:
      "https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Disques de frein",
    categorie: "Freinage",
    vehicule: {
      marque: "Peugeot",
      modele: "Peugeot 208",
      annee: "2015 - 2019",
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 8500,
    boutique: "Auto Pièces El Amal",
    image:
      "https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop",
  },
  {
    id: 4,
    name: "Liquide de frein",
    categorie: "Freinage",
    vehicule: {
      marque: "Peugeot",
      modele: "Peugeot 208",
      annee: "2015 - 2019",
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 2500,
    boutique: "Auto Pièces El Amal",
    image:
      "https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop",
  },
  {
    id: 5,
    name: "Plaquettes de frein avant",
    categorie: "Freinage",
    vehicule: {
      marque: "Peugeot",
      modele: "Peugeot 208",
      annee: "2015 - 2019",
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "Stock limité",
    prix: 6500,
    boutique: "Auto Pièces El Amal",
    image:
      "https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop",
  },
];

// Status Badge Component
function StatusBadge({ type, value }) {
  const statusStyles = {
    etat: {
      Neuf: "bg-green-100 text-green-700",
      Occasion: "bg-orange-100 text-orange-700",
    },
    disponibilite: {
      "En stock": "bg-blue-100 text-blue-700",
      "Stock limité": "bg-yellow-100 text-yellow-700",
      "Sur commande": "bg-purple-100 text-purple-700",
    },
  };

  const statusIcons = {
    "En stock": <Check className="w-4 h-4" />,
    "Stock limité": <AlertCircle className="w-4 h-4" />,
    "Sur commande": "📦",
    Neuf: "✓",
    Occasion: "⚙️",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
        statusStyles[type][value] || "bg-gray-100 text-gray-700"
      }`}>
      {statusIcons[value]}
      {value}
    </div>
  );
}

export default function PartDetails() {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { id } = useParams();
  const samplePart = parts.find((item) => {
    return item.id === parseInt(id);
  });

  const handleAddToCart = () => {
    console.log(`Added ${quantity} items to cart`);
    // Add to cart logic here
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.history.back();
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              Détails du produit
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-8">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Image Column */}
          <div className="flex flex-col gap-4">
            <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden aspect-square flex items-center justify-center">
              <img
                src={samplePart.image}
                alt={samplePart.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge type="etat" value={samplePart.etat} />
              </div>
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-sm">
                  {samplePart.categorie}
                </span>
              </div>
            </div>

            {/* Image Thumbnails placeholder */}
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  <img
                    src={samplePart.image}
                    alt="thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col gap-6">
            {/* Title & Vehicle Info */}
            <div className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {samplePart.name}
              </h1>
              <p className="text-slate-600 text-lg">
                <span className="font-semibold text-slate-900">
                  {samplePart.vehicule.marque}
                </span>{" "}
                {samplePart.vehicule.modele} • {samplePart.vehicule.annee} •{" "}
                {samplePart.vehicule.carburant}
              </p>
            </div>

            {/* Price & Availability */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Prix
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {samplePart.prix.toLocaleString("fr-DZ")}
                    <span className="text-lg text-slate-600 ml-2">DZD</span>
                  </p>
                </div>
                <StatusBadge
                  type="disponibilite"
                  value={samplePart.disponibilite}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Localisation</p>
                  <p className="font-semibold text-slate-900">
                    📍 {samplePart.localisation}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Magasin</p>
                  <p className="font-semibold text-slate-900">
                    🏪 {samplePart.boutique}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {samplePart.description}
              </p>
            </div>

            {/* Specifications */}

            {/* Quantity & Actions */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="quantity"
                    className="text-sm font-medium text-slate-700">
                    Quantité
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex gap-3">
                  <button
                    onClick={() => (window.location.href = `/buy-part/${id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Achetez
                  </button>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      isFavorite
                        ? "bg-red-100 border-red-300 text-red-600"
                        : "border-slate-300 text-slate-600 hover:border-red-300"
                    }`}>
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button className="px-4 py-3 rounded-lg border-2 border-slate-300 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Parts Sections */}
        <div className="space-y-12">
          {/* Same Shop Parts */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Pièces du même magasin
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Autres produits disponibles chez {samplePart.boutique}
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors">
                Voir le magasin →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {relatedParts.slice(0, 4).map((part, idx) => (
                <PartCard key={idx} part={part} />
              ))}
            </div>
          </section>

          {/* Related Parts */}
          <section className="border-t border-slate-200 pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Pièces avec relation
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Produits compatibles et recommandés
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {relatedParts.map((part, idx) => (
                <PartCard key={idx} part={part} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer spacer */}
      <div className="h-12" />
    </div>
  );
}
