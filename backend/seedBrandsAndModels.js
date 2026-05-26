// seedBrandsAndModels.js

const prisma = require("./src/prisma/client");

const brandsData = [
  {
    name: "Renault",
    country: "France",
    models: [
      "Clio",
      "Symbol",
      "Megane",
      "Kadjar",
      "Captur",
      "Kangoo",
      "Duster",
      "Logan",
      "Sandero",
    ],
  },
  {
    name: "Peugeot",
    country: "France",
    models: [
      "206",
      "207",
      "208",
      "301",
      "307",
      "308",
      "3008",
      "2008",
      "Partner",
    ],
  },
  {
    name: "Volkswagen",
    country: "Germany",
    models: ["Golf", "Polo", "Passat", "Tiguan", "Touareg", "Caddy"],
  },
  {
    name: "Hyundai",
    country: "South Korea",
    models: ["i10", "i20", "Accent", "Elantra", "Tucson", "Santa Fe"],
  },
  {
    name: "Kia",
    country: "South Korea",
    models: ["Picanto", "Rio", "Cerato", "Sportage", "Sorento"],
  },
  {
    name: "Toyota",
    country: "Japan",
    models: ["Yaris", "Corolla", "Hilux", "Land Cruiser", "RAV4"],
  },
  {
    name: "Mercedes-Benz",
    country: "Germany",
    models: ["A-Class", "C-Class", "E-Class", "GLA", "GLE", "Sprinter"],
  },
  {
    name: "BMW",
    country: "Germany",
    models: ["1 Series", "3 Series", "5 Series", "X1", "X3", "X5"],
  },
  {
    name: "Audi",
    country: "Germany",
    models: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  },
  {
    name: "Dacia",
    country: "Romania",
    models: ["Logan", "Sandero", "Duster", "Lodgy"],
  },
];

async function seed() {
  try {
    console.log("🚀 Starting seed...");

    for (const brandData of brandsData) {
      let brand = await prisma.brand.findFirst({
        where: {
          name: brandData.name,
        },
      });

      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: brandData.name,
            country: brandData.country,
          },
        });

        console.log(`✅ Brand created: ${brand.name}`);
      } else {
        console.log(`⚠️ Brand already exists: ${brand.name}`);
      }

      for (const modelName of brandData.models) {
        const existingModel = await prisma.model.findFirst({
          where: {
            name: modelName,
            brand_id: brand.id,
          },
        });

        if (!existingModel) {
          await prisma.model.create({
            data: {
              name: modelName,
              brand_id: brand.id,
              year_start: 2000,
            },
          });

          console.log(`   ↳ Model created: ${modelName}`);
        } else {
          console.log(`   ⚠️ Model already exists: ${modelName}`);
        }
      }
    }

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
