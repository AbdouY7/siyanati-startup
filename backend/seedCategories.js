// seedCategories.js

const prisma = require("./src/prisma/client");

const categories = [
  {
    name: "Engine",
    slug: "engine",
    children: [
      "Oil Filter",
      "Air Filter",
      "Fuel Filter",
      "Spark Plugs",
      "Timing Belt",
      "Water Pump",
      "Radiator",
      "Engine Mount",
      "Turbocharger",
      "Alternator",
      "Starter",
      "Battery",
    ],
  },

  {
    name: "Brakes",
    slug: "brakes",
    children: [
      "Brake Pads",
      "Brake Discs",
      "Brake Drums",
      "Brake Shoes",
      "Brake Caliper",
      "Brake Fluid",
      "ABS Sensor",
      "Master Cylinder",
    ],
  },

  {
    name: "Suspension",
    slug: "suspension",
    children: [
      "Shock Absorber",
      "Coil Spring",
      "Control Arm",
      "Ball Joint",
      "Stabilizer Link",
      "Wheel Bearing",
      "Suspension Bushings",
    ],
  },

  {
    name: "Transmission",
    slug: "transmission",
    children: [
      "Clutch Kit",
      "Gearbox",
      "Transmission Oil",
      "Drive Shaft",
      "CV Joint",
      "Flywheel",
      "Gear Lever",
    ],
  },

  {
    name: "Electrical",
    slug: "electrical",
    children: [
      "Battery",
      "Headlight",
      "Tail Light",
      "Fuse",
      "Relay",
      "Sensors",
      "Ignition Coil",
      "Wiper Motor",
      "Horn",
    ],
  },

  {
    name: "Cooling System",
    slug: "cooling-system",
    children: [
      "Radiator",
      "Cooling Fan",
      "Thermostat",
      "Coolant",
      "Water Pump",
      "Radiator Hose",
    ],
  },

  {
    name: "Air Conditioning",
    slug: "air-conditioning",
    children: [
      "AC Compressor",
      "Cabin Filter",
      "Condenser",
      "Evaporator",
      "AC Gas",
    ],
  },

  {
    name: "Exhaust",
    slug: "exhaust",
    children: [
      "Muffler",
      "Catalytic Converter",
      "Exhaust Pipe",
      "Oxygen Sensor",
    ],
  },

  {
    name: "Steering",
    slug: "steering",
    children: [
      "Steering Rack",
      "Power Steering Pump",
      "Tie Rod End",
      "Steering Column",
    ],
  },

  {
    name: "Body Parts",
    slug: "body-parts",
    children: [
      "Front Bumper",
      "Rear Bumper",
      "Fender",
      "Hood",
      "Doors",
      "Mirror",
      "Grille",
      "Windshield",
    ],
  },

  {
    name: "Interior",
    slug: "interior",
    children: [
      "Seats",
      "Dashboard",
      "Floor Mats",
      "Steering Wheel",
      "Gear Knob",
      "Seat Belt",
    ],
  },

  {
    name: "Wheels & Tires",
    slug: "wheels-tires",
    children: ["Tires", "Rims", "Wheel Bolts", "Hub Caps", "Wheel Bearing"],
  },

  {
    name: "Fuel System",
    slug: "fuel-system",
    children: [
      "Fuel Pump",
      "Fuel Injector",
      "Fuel Tank",
      "Fuel Pressure Regulator",
    ],
  },

  {
    name: "Lighting",
    slug: "lighting",
    children: [
      "Headlights",
      "Fog Lights",
      "LED Bulbs",
      "Indicators",
      "Interior Lights",
    ],
  },

  {
    name: "Accessories",
    slug: "accessories",
    children: [
      "Phone Holder",
      "Reverse Camera",
      "Parking Sensors",
      "Car Cover",
      "Roof Rack",
      "Multimedia Screen",
    ],
  },
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

async function seedCategories() {
  try {
    console.log("🚀 Seeding categories...");

    for (const parentCategory of categories) {
      // Check parent
      let parent = await prisma.category.findFirst({
        where: {
          name: parentCategory.name,
        },
      });

      // Create parent
      if (!parent) {
        parent = await prisma.category.create({
          data: {
            name: parentCategory.name,
            slug: parentCategory.slug,
          },
        });

        console.log(`✅ Parent category created: ${parent.name}`);
      } else {
        console.log(`⚠️ Parent already exists: ${parent.name}`);
      }

      // Create children
      for (const childName of parentCategory.children) {
        const existingChild = await prisma.category.findFirst({
          where: {
            name: childName,
            parent_id: parent.id,
          },
        });

        if (!existingChild) {
          await prisma.category.create({
            data: {
              name: childName,
              slug: slugify(childName),
              parent_id: parent.id,
            },
          });

          console.log(`   ↳ Child category created: ${childName}`);
        } else {
          console.log(`   ⚠️ Child already exists: ${childName}`);
        }
      }
    }

    console.log("🎉 Categories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
