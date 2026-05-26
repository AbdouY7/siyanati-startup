const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize cron jobs
  const { initCronJobs } = require("./services/cron.service");
  initCronJobs();
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed");
    await prisma.$disconnect(); // close DB connections
    console.log("DB disconnected");
    process.exit(0);
  });

  // Force kill if shutdown takes too long
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
};

process.once("SIGUSR2", () => shutdown("SIGUSR2")); // nodemon uses this
process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // system kill
