require("dotenv").config();
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Use max:1 to prevent concurrent queries that crash the cloud pooler
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log("Step 1: Auth middleware query...");
    const user = await prisma.user.findFirst({
      where: { role: "professional" },
      include: {
        store_profile: { select: { is_frozen: true } },
        professional_profile: { select: { is_frozen: true } },
      },
    });
    console.log("  User found:", user.id, user.role);

    console.log("Step 2: Get professional profile...");
    const profile = await prisma.professionalProfile.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });
    console.log("  Profile:", profile);

    console.log("Step 3: Find appointments (the one that was crashing)...");
    const appointments = await prisma.appointment.findMany({
      where: { professional_id: profile.id },
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            client_profile: { select: { full_name: true } },
          },
        },
        professional: {
          select: { id: true, full_name: true, specialty_type: true },
        },
        vehicle: {
          select: {
            id: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
          },
        },
        reviews: {
          select: { id: true, rating: true, comment: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip: 0,
      take: 10,
    });
    console.log("  Appointments found:", appointments.length);

    console.log("Step 4: Count...");
    const total = await prisma.appointment.count({
      where: { professional_id: profile.id },
    });
    console.log("  Total:", total);

    console.log("\n=== SUCCESS - full flow works with max:1 pool! ===");
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
