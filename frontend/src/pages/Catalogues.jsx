import React, { useState } from "react";
import Input from "../components/uiComponents/InputField";
import { IoSearchOutline } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import { Drone } from "lucide-react";
import DropDownList from "../components/uiComponents/DropDownList";
import Part from "../components/uiComponents/Part";
const Catalogues = () => {
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
    },
    {
      name: "Marque du véhicule",
      key: "brand",
      options: [
        "Toyota",
        "Peugeot",
        "Renault",
        "Volkswagen",
        "Hyundai",
        "Ford",
      ],
    },
    {
      name: "Modèle du véhicule",
      key: "model",
      options: ["Corolla", "Clio", "Golf", "Polo", "Accent", "Focus"],
    },
    {
      name: "Année / Génération",
      key: "year",
      options: ["2015–2017", "2018–2020", "2021–2023", "2024+"],
    },
    {
      name: "État de la pièce",
      key: "condition",
      options: ["Neuf", "Occasion", "Reconditionné"],
    },
    {
      name: "Disponibilité",
      key: "availability",
      options: ["En stock", "Sur commande", "Indisponible"],
    },
    {
      name: "Type de moteur",
      key: "engineType",
      options: ["Essence", "Diesel", "Hybride", "Électrique"],
    },
  ];

  const [partList, setPartList] = useState([
    {
      name: "Plaquettes de frein avant",
      categorie: "Freinage",
      image: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96",
      vehicule: {
        marque: "Volkswagen",
        modele: "Golf",
        annee: 2020,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 8500,
      boutique: "Auto Pièces Sétif",
    },
    {
      name: "Disque de frein arrière",
      categorie: "Freinage",
      image: "https://images.unsplash.com/photo-1613214149922-f1809c99b414",
      vehicule: {
        marque: "Peugeot",
        modele: "308",
        annee: 2019,
        carburant: "Diesel",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 12000,
      boutique: "Frein Plus Algérie",
    },
    {
      name: "Filtre à huile",
      categorie: "Entretien",
      image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04",
      vehicule: {
        marque: "Renault",
        modele: "Clio",
        annee: 2018,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 1800,
      boutique: "Garage El Amel",
    },
    {
      name: "Filtre à air",
      categorie: "Entretien",
      image: "https://images.unsplash.com/photo-1617886903355-9357c1a5c09b",
      vehicule: {
        marque: "Hyundai",
        modele: "Accent",
        annee: 2021,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 2200,
      boutique: "Auto Services Plus",
    },
    {
      name: "Batterie 60Ah",
      categorie: "Électricité",
      image: "https://images.unsplash.com/photo-1581091215367-59ab6b1c6c0c",
      vehicule: {
        marque: "Toyota",
        modele: "Corolla",
        annee: 2017,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 19500,
      boutique: "Batteries Pro",
    },
    {
      name: "Alternateur",
      categorie: "Électricité",
      image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76",
      vehicule: {
        marque: "Ford",
        modele: "Focus",
        annee: 2016,
        carburant: "Diesel",
      },
      etat: "Occasion",
      disponibilite: "Stock limité",
      prix: 28000,
      boutique: "Pièces Auto Nord",
    },
    {
      name: "Amortisseur avant",
      categorie: "Suspension",
      image: "https://images.unsplash.com/photo-1617814076668-28fdbb7a42b9",
      vehicule: {
        marque: "Kia",
        modele: "Rio",
        annee: 2019,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 15000,
      boutique: "Suspension Expert",
    },
    {
      name: "Bras de suspension",
      categorie: "Suspension",
      image: "https://images.unsplash.com/photo-1600359753093-d1f44b6f5c7c",
      vehicule: {
        marque: "BMW",
        modele: "Série 3",
        annee: 2018,
        carburant: "Diesel",
      },
      etat: "Neuf",
      disponibilite: "Sur commande",
      prix: 22000,
      boutique: "German Auto Parts",
    },
    {
      name: "Bougies d’allumage (jeu de 4)",
      categorie: "Moteur",
      image: "https://images.unsplash.com/photo-1600861195091-690c92b7c5e4",
      vehicule: {
        marque: "Seat",
        modele: "Ibiza",
        annee: 2020,
        carburant: "Essence",
      },
      etat: "Neuf",
      disponibilite: "En stock",
      prix: 4800,
      boutique: "Meca Store",
    },
    {
      name: "Injecteur diesel",
      categorie: "Moteur",
      image: "https://images.unsplash.com/photo-1621961458348-f013d219b4c6",
      vehicule: {
        marque: "Mercedes",
        modele: "Classe C",
        annee: 2017,
        carburant: "Diesel",
      },
      etat: "Occasion",
      disponibilite: "Stock limité",
      prix: 35000,
      boutique: "Diesel Tech",
    },

    // 🔹 Same pattern continues for remaining parts
  ]);
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden p-6">
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-4xl text-primary-dark font-bold font-secondary uppercase">
          Catalogues
        </h1>
        <p className="text-gray-600 text-sm max-w-[600px] font-primary">
          Vous ne pouvez pas commander plusieurs pièces provenant de magasins
          différents dans une seule commande. Vous devrez passer une commande
          séparée pour chaque pièce.
        </p>
      </div>
      <div>
        <div className="flex items-center justify-center gap-2 w-1/4 ">
          <Input
            name="search"
            placeholder="Rechercher une pièce..."
            type="search"
            style="default"
            iconLeft={IoSearchOutline}
          />
          <div className="flex items-center gap-2 bg-primary text-white px-3 py-3 rounded-md cursor-pointer hover:bg-secondary transition duration-300">
            <IoSearchOutline size={20} />
          </div>
        </div>

        <div className="flex  gap-4 mt-4">
          {/* Filtres */}
          {filters.map((filter) => (
            <DropDownList
              key={filter.key}
              name={filter.key}
              placeholder={filter.name}
              options={filter.options.map((option) => ({
                value: option,
                label: option,
              }))}
            />
          ))}
          <div className="flex items-center gap-2 bg-primary text-white px-3 py-3 rounded-md cursor-pointer hover:bg-secondary transition duration-300">
            <FiFilter size={20} />
          </div>
        </div>
      </div>
      <div>
        {/* Liste des pièces */}
        {partList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {partList.map((part, index) => (
              <Part key={index} part={part} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            Aucune pièce trouvée.
          </p>
        )}
      </div>
    </div>
  );
};

export default Catalogues;
