require("dotenv").config();
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Set to 1 to prevent concurrent query crashing with Prisma driver adapter on Prisma Cloud pooler
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if can't connect
  keepAlive: true, // send TCP keepalives
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  // this prevents the app from crashing on a lost connection
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
