const { getAppointments } = require("./src/controllers/appointment.controller");
const prisma = require("./src/prisma/client");

async function main() {
  const profile = await prisma.professionalProfile.findFirst();
  if (!profile) {
    console.log("No professional profile found!");
    return;
  }
  console.log("Using professional with user_id:", profile.user_id);
  
  const req = {
    user: { id: profile.user_id, role: "professional" },
    query: {
      page: "1",
      limit: "10"
    }
  };
  
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log("RES JSON:", JSON.stringify(data, null, 2));
    }
  };

  const next = (err) => {
    console.error("NEXT ERR:", err);
  };

  await getAppointments(req, res, next);
  await prisma.$disconnect();
}

main();
