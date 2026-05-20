require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({
      where: { role: "professional" },
      include: {
        store_profile: { select: { is_frozen: true } },
        professional_profile: { select: { is_frozen: true } },
      },
    });
    console.log("  User found:", user.id, user.role);

    const profile = await prisma.professionalProfile.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    });

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
    console.log("SUCCESS using native PrismaClient!");
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
