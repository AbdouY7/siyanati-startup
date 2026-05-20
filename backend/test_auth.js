const prisma = require("./src/prisma/client");

async function main() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        store_profile: { select: { is_frozen: true } },
        professional_profile: { select: { is_frozen: true } }
      }
    });
    console.log("Success", user);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
