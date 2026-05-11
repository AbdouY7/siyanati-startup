const stores = [
  {
    id: "b1a7c1e2-1a11-4c33-9c21-111aaa001",
    user_id: "u001-aaa-111",
    owner_name: "Ahmed Benali",
    store_name: "Auto Pièces Sétif",
    description:
      "Magasin spécialisé dans les pièces automobiles neuves et d’origine pour véhicules européens et asiatiques.",
    address: "Rue des Frères Bouadou, El Eulma",
    wilaya: "Sétif",
    location_coordinates: {
      lat: 36.1527,
      lng: 5.69,
    },
    documents: [
      "https://example.com/docs/registre-commerce.pdf",
      "https://example.com/docs/identite-fiscale.pdf",
    ],
    images: [
      "https://images.unsplash.com/photo-1567789884554-0b844b597180",
      "https://images.unsplash.com/photo-1581091870627-3fdc90a7c1f1",
    ],
    logo_url: "https://images.unsplash.com/photo-1612832020746-3f6c7b5e3d41",
    verified: true,
    rating_avg: 4.6,
    rating_count: 128,
    created_at: "2024-11-02T10:15:00Z",
  },

  {
    id: "b1a7c1e2-1a11-4c33-9c21-111aaa002",
    user_id: "u002-bbb-222",
    owner_name: "Karim Haddad",
    store_name: "Frein Plus Algérie",
    description:
      "Spécialiste des systèmes de freinage : disques, plaquettes et kits complets pour voitures et utilitaires.",
    address: "Zone Industrielle Rouiba",
    wilaya: "Alger",
    location_coordinates: {
      lat: 36.7389,
      lng: 3.3407,
    },
    documents: ["https://example.com/docs/registre-commerce.pdf"],
    images: [
      "https://images.unsplash.com/photo-1597008641621-6c6d2d7a41f1",
      "https://images.unsplash.com/photo-1601924638867-3ec62eae9b7f",
    ],
    logo_url: "https://images.unsplash.com/photo-1608508644127-ba99d7732fee",
    verified: true,
    rating_avg: 4.3,
    rating_count: 94,
    created_at: "2024-10-15T08:40:00Z",
  },

  {
    id: "b1a7c1e2-1a11-4c33-9c21-111aaa003",
    user_id: "u003-ccc-333",
    owner_name: "Yacine Bouzid",
    store_name: "Garage El Amel",
    description:
      "Vente de pièces d’entretien et service mécanique rapide pour voitures particulières.",
    address: "Cité 1000 Logements, Bab Ezzouar",
    wilaya: "Alger",
    location_coordinates: {
      lat: 36.7212,
      lng: 3.1816,
    },
    documents: [],
    images: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4"],
    logo_url: "https://images.unsplash.com/photo-1620283085068-5c9b1c63c7ad",
    verified: false,
    rating_avg: 3.9,
    rating_count: 41,
    created_at: "2025-01-08T14:05:00Z",
  },

  {
    id: "b1a7c1e2-1a11-4c33-9c21-111aaa004",
    user_id: "u004-ddd-444",
    owner_name: "Mohamed Saidi",
    store_name: "German Auto Parts",
    description:
      "Pièces automobiles haut de gamme pour véhicules allemands : BMW, Audi, Mercedes.",
    address: "Route de Constantine",
    wilaya: "Annaba",
    location_coordinates: {
      lat: 36.904,
      lng: 7.7566,
    },
    documents: ["https://example.com/docs/registre-commerce.pdf"],
    images: [
      "https://images.unsplash.com/photo-1617886903355-9357c1a5c09b",
      "https://images.unsplash.com/photo-1600359753093-d1f44b6f5c7c",
    ],
    logo_url: "https://images.unsplash.com/photo-1581092334651-ddf26d9c6b03",
    verified: true,
    rating_avg: 4.8,
    rating_count: 67,
    created_at: "2024-09-20T09:30:00Z",
  },

  {
    id: "b1a7c1e2-1a11-4c33-9c21-111aaa005",
    user_id: "u005-eee-555",
    owner_name: "Riad Khelifi",
    store_name: "Diesel Tech",
    description:
      "Expert en systèmes diesel : injecteurs, pompes haute pression et diagnostics.",
    address: "Zone Industrielle, Bir El Djir",
    wilaya: "Oran",
    location_coordinates: {
      lat: 35.6987,
      lng: -0.6417,
    },
    documents: [],
    images: ["https://images.unsplash.com/photo-1604328698692-f76ea9498e76"],
    logo_url: "https://images.unsplash.com/photo-1581091870627-3fdc90a7c1f1",
    verified: true,
    rating_avg: 4.2,
    rating_count: 53,
    created_at: "2024-12-05T11:50:00Z",
  },
];

export default stores;
