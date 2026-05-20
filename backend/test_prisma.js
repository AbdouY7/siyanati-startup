const prisma = require("./src/prisma/client");

const appointmentListInclude = {
  customer: {
    select: {
      id: true,
      phone: true,
      client_profile: { select: { full_name: true } },
    },
  },
  professional: {
    select: {
      id: true,
      full_name: true,
      specialty_type: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      brand: { select: { name: true } },
      model: { select: { name: true } },
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
    },
  },
};

async function main() {
  try {
    const data = await prisma.appointment.findMany({
      include: appointmentListInclude,
      take: 1,
    });
    console.log("Success!", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
