require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash("StrongAdminPass123", 12);

  await prisma.user.create({
    data: {
      email: "admin@siyanati.com",
      phone: "0770000000",
      password_hash,
      role: "admin",
      is_active: true,
      email_verified: true,
    },
  });

  console.log("✅ Admin created successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
