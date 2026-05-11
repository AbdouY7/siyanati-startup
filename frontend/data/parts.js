const parts = [
  {
    id: 1,
    name: "Plaquettes de frein avant",
    categorie: "Freinage",
    // Brake pads close-up — clearly shows brake pad friction material
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
    description:
      "Plaquettes de frein avant de haute qualité assurant un freinage efficace, silencieux et durable. Compatibles avec les systèmes de freinage d'origine.",
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
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa001",
  },
  {
    id: 2,
    name: "Disque de frein arrière",
    categorie: "Freinage",
    // Brake disc rotor — clearly shows a ventilated brake disc
    image: "",
    description:
      "Disque de frein arrière robuste offrant une excellente dissipation de chaleur et une performance constante même en conditions intensives.",
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
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa002",
  },
  {
    id: 3,
    name: "Filtre à huile",
    categorie: "Entretien",
    // Oil filter — shows a cylindrical oil filter clearly
    image:
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=80",
    description:
      "Filtre à huile moteur conçu pour éliminer les impuretés et protéger le moteur.",
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
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa003",
  },
  {
    id: 4,
    name: "Filtre à air",
    categorie: "Entretien",
    // Air filter — shows a flat panel air filter
    image:
      "https://images.unsplash.com/photo-1617886903355-9357c1a5c09b?auto=format&fit=crop&w=800&q=80",
    description:
      "Filtre à air haute efficacité améliorant la combustion du moteur.",
    vehicule: {
      marque: "Hyundai",
      modele: "Accent",
      annee: 2021,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 2200,
    boutique: "Garage El Amel",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa003",
  },
  {
    id: 5,
    name: "Batterie 60Ah",
    categorie: "Électricité",
    // Car battery — shows a 12V automotive battery clearly
    image:
      "https://images.unsplash.com/photo-1620714223084-8fcacc2107c1?auto=format&fit=crop&w=800&q=80",
    description:
      "Batterie automobile 60Ah offrant une puissance de démarrage fiable.",
    vehicule: {
      marque: "Toyota",
      modele: "Corolla",
      annee: 2017,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 19500,
    boutique: "Auto Pièces Sétif",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa001",
  },
  {
    id: 6,
    name: "Alternateur",
    categorie: "Électricité",
    // Alternator — shows an automotive alternator unit
    image:
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=800&q=80",
    description:
      "Alternateur reconditionné assurant la recharge optimale de la batterie.",
    vehicule: {
      marque: "Ford",
      modele: "Focus",
      annee: 2016,
      carburant: "Diesel",
    },
    etat: "Occasion",
    disponibilite: "Stock limité",
    prix: 28000,
    boutique: "Diesel Tech",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa005",
  },
  {
    id: 7,
    name: "Amortisseur avant",
    categorie: "Suspension",
    // Shock absorber / strut — shows suspension damper clearly
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    description:
      "Amortisseur avant neuf améliorant le confort et la stabilité.",
    vehicule: {
      marque: "Kia",
      modele: "Rio",
      annee: 2019,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 15000,
    boutique: "German Auto Parts",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa004",
  },
  {
    id: 8,
    name: "Bras de suspension",
    categorie: "Suspension",
    // Control arm / suspension arm — shows a metal suspension arm
    image:
      "https://images.unsplash.com/photo-1600359753093-d1f44b6f5c7c?auto=format&fit=crop&w=800&q=80",
    description:
      "Bras de suspension renforcé pour une excellente tenue de route.",
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
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa004",
  },
  {
    id: 9,
    name: "Bougies d'allumage (jeu de 4)",
    categorie: "Moteur",
    // Spark plugs — shows spark plugs clearly
    image:
      "https://images.unsplash.com/photo-1603200888741-93d77a61a1a0?auto=format&fit=crop&w=800&q=80",
    description:
      "Bougies garantissant une combustion optimale et un démarrage rapide.",
    vehicule: {
      marque: "Seat",
      modele: "Ibiza",
      annee: 2020,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 4800,
    boutique: "Garage El Amel",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa003",
  },
  {
    id: 10,
    name: "Injecteur diesel",
    categorie: "Moteur",
    // Diesel fuel injector — shows a common rail injector
    image:
      "https://images.unsplash.com/photo-1621961458348-f013d219b4c6?auto=format&fit=crop&w=800&q=80",
    description:
      "Injecteur diesel testé assurant une injection précise du carburant.",
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
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa005",
  },
  {
    id: 11,
    name: "Courroie de distribution",
    categorie: "Moteur",
    // Timing belt — shows a toothed rubber timing belt
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    description:
      "Kit de distribution complet garantissant la synchronisation moteur.",
    vehicule: {
      marque: "Renault",
      modele: "Megane",
      annee: 2019,
      carburant: "Diesel",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 32000,
    boutique: "Garage El Amel",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa003",
  },
  {
    id: 12,
    name: "Plaquettes de frein arrière",
    categorie: "Freinage",
    // Rear brake pads — shows brake pad set
    image:
      "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80",
    description: "Plaquettes arrière assurant sécurité et performance.",
    vehicule: {
      marque: "Dacia",
      modele: "Duster",
      annee: 2021,
      carburant: "Diesel",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 7800,
    boutique: "Frein Plus Algérie",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa002",
  },
  {
    id: 13,
    name: "Capteur ABS",
    categorie: "Électronique",
    // ABS sensor / wheel speed sensor — shows an electronic automotive sensor
    image: "",
    description: "Capteur ABS assurant un freinage contrôlé.",
    vehicule: {
      marque: "Volkswagen",
      modele: "Passat",
      annee: 2018,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 14500,
    boutique: "Auto Pièces Sétif",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa001",
  },
  {
    id: 14,
    name: "Pompe à carburant",
    categorie: "Moteur",
    // Fuel pump — shows a fuel pump module
    image: "",
    description: "Pompe à carburant assurant une alimentation stable.",
    vehicule: {
      marque: "Ford",
      modele: "Mondeo",
      annee: 2016,
      carburant: "Diesel",
    },
    etat: "Occasion",
    disponibilite: "Stock limité",
    prix: 27000,
    boutique: "Diesel Tech",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa005",
  },
  {
    id: 15,
    name: "Radiateur moteur",
    categorie: "Refroidissement",
    // Radiator — shows a car radiator / cooling system
    image: "",
    description: "Radiateur haute performance pour refroidissement optimal.",
    vehicule: {
      marque: "Hyundai",
      modele: "Elantra",
      annee: 2020,
      carburant: "Essence",
    },
    etat: "Neuf",
    disponibilite: "En stock",
    prix: 24000,
    boutique: "Auto Pièces Sétif",
    store_id: "b1a7c1e2-1a11-4c33-9c21-111aaa001",
  },
];

export default parts;
