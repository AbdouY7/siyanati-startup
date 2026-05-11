const diagnosticPosts = [
  {
    id: "post-001",
    posted_at: "2 hours ago",

    user: {
      full_name: "Karim Benali",
      wilaya: "Alger",
      profile_picture: "https://randomuser.me/api/portraits/men/32.jpg",
    },

    title: "Voyant moteur allumé et perte de puissance",

    car: {
      brand: "Volkswagen",
      model: "Golf 7",
      year: 2018,
      engine: "1.4 TSI Essence",
    },

    car_images: [
      "https://images.unsplash.com/photo-1617814065893-00757125bde2",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a",
    ],

    tags: ["check engine", "engine power loss", "fuel system", "sensor issue"],

    description:
      "Depuis quelques jours, le voyant moteur s’allume après quelques minutes de conduite. La voiture perd de la puissance surtout en montée. Aucun bruit étrange mais la consommation a augmenté. Quelqu’un a déjà eu ce problème ?",
  },

  {
    id: "post-002",
    posted_at: "1 day ago",

    user: {
      full_name: "Yacine Messaoudi",
      wilaya: "Oran",
      profile_picture: "https://randomuser.me/api/portraits/men/45.jpg",
    },

    title: "Démarrage difficile à froid",

    car: {
      brand: "Peugeot",
      model: "308",
      year: 2016,
      engine: "1.6 HDi Diesel",
    },

    car_images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
    ],

    tags: ["cold start", "battery", "starter", "diesel issue"],

    description:
      "Le matin, la voiture met beaucoup de temps à démarrer. Une fois démarrée, elle roule normalement. La batterie est récente. Le problème apparaît surtout quand il fait froid.",
  },

  {
    id: "post-003",
    posted_at: "3 days ago",

    user: {
      full_name: "Amine Zerrouki",
      wilaya: "Constantine",
      profile_picture: "https://randomuser.me/api/portraits/men/12.jpg",
    },

    title: "Bruit étrange lors du freinage",

    car: {
      brand: "Toyota",
      model: "Corolla",
      year: 2019,
      engine: "1.8 Essence",
    },

    car_images: [
      "https://images.unsplash.com/photo-1605559424843-b2f5c1e16cda",
      "https://images.unsplash.com/photo-1549921296-3fd62b6c34a7",
    ],

    tags: ["brake noise", "brake pads", "suspension", "safety"],

    description:
      "Un bruit métallique apparaît uniquement quand je freine à basse vitesse. Les plaquettes ont été changées il y a 6 mois. Est-ce un problème de disque ou autre chose ?",
  },

  {
    id: "post-004",
    posted_at: "5 days ago",

    user: {
      full_name: "Sofiane Khelifi",
      wilaya: "Sétif",
      profile_picture: "https://randomuser.me/api/portraits/men/67.jpg",
    },

    title: "Surchauffe moteur en circulation urbaine",

    car: {
      brand: "Hyundai",
      model: "Accent",
      year: 2015,
      engine: "1.6 Essence",
    },

    car_images: [
      "https://images.unsplash.com/photo-1621961458348-f013d219b50c",
    ],

    tags: ["engine overheating", "cooling system", "radiator", "thermostat"],

    description:
      "La température du moteur monte rapidement quand je suis dans les embouteillages. Sur route, tout est normal. Le ventilateur fonctionne mais le problème persiste.",
  },

  {
    id: "post-005",
    posted_at: "1 week ago",

    user: {
      full_name: "Nabil Touati",
      wilaya: "Blida",
      profile_picture: "https://randomuser.me/api/portraits/men/81.jpg",
    },

    title: "Vibrations importantes à haute vitesse",

    car: {
      brand: "Renault",
      model: "Clio 4",
      year: 2017,
      engine: "1.5 dCi Diesel",
    },

    car_images: [
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    ],

    tags: ["vibration", "wheel alignment", "suspension", "tires"],

    description:
      "À partir de 90 km/h, le volant commence à vibrer fortement. Les pneus sont en bon état. Le problème est apparu après un choc avec un trottoir.",
  },
];

export default diagnosticPosts;
