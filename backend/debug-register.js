require("dotenv").config();
const prisma = require("./src/prisma/client");
const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");

(async () => {
  const userId = randomUUID();
  try {
    const password_hash = await bcrypt.hash("TestPass123", 12);
    const result = await prisma.user.create({
      data: {
        id: userId,
        email: "debug-test@example.com",
        password_hash,
        role: "customer",
        client_profile: {
          create: {
            full_name: "Debug User",
            phone: "999888777",
            wilaya: "Test",
            address: "123 Test Ave",
            date_of_birth: new Date("1990-01-01"),
          },
        },
      },
    });
    console.log("SUCCESS", result);
    await prisma.user.delete({ where: { id: userId } });
    console.log("cleanup done");
  } catch (err) {
    console.error("ERROR", err);
  } finally {
    await prisma.$disconnect();
  }
})();
