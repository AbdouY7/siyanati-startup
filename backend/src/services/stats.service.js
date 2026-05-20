/**
 * Dashboard Statistics Service
 * ─────────────────────────────────────────────────────────────────────
 * All heavy DB queries for the admin dashboard live here.
 * Uses Prisma aggregations (count, groupBy) instead of findMany + JS logic.
 * Results are cached in-memory with a 5-minute TTL.
 */
const prisma = require("../prisma/client");
const { getCache, setCache } = require("../utils/cache");

const CACHE_KEY = "dashboard_overview";
const CACHE_TTL = 300; // 5 minutes

/**
 * Fetch all dashboard data in one call.
 * Returns cached data when available; otherwise queries the DB.
 */
async function getDashboardStats() {
  // 1. Check cache first
  const cached = getCache(CACHE_KEY);
  if (cached) {
    console.log("[Dashboard] Cache HIT");
    return cached;
  }
  console.log("[Dashboard] Cache MISS — querying database…");

  const now = new Date();
  const currentYear = now.getFullYear();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(currentYear, 0, 1);

  // ── Execute queries sequentially to prevent Neon connection pool exhaustion ──
  
  // 1. Total counts
  const totalClients = await prisma.user.count({ where: { role: "customer" } });
  const totalStores = await prisma.storeProfile.count();
  const totalProfessionals = await prisma.professionalProfile.count();
  const totalParts = await prisma.part.count();

  // 2a. Trend – current 30 days
  const clientsCurrent = await prisma.user.count({ where: { role: "customer", created_at: { gte: thirtyDaysAgo } } });
  const storesCurrent = await prisma.storeProfile.count({ where: { created_at: { gte: thirtyDaysAgo } } });
  const prosCurrent = await prisma.professionalProfile.count({ where: { created_at: { gte: thirtyDaysAgo } } });
  const partsCurrent = await prisma.part.count({ where: { created_at: { gte: thirtyDaysAgo } } });

  // 2b. Trend – previous 30 days
  const clientsPrevious = await prisma.user.count({ where: { role: "customer", created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
  const storesPrevious = await prisma.storeProfile.count({ where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
  const prosPrevious = await prisma.professionalProfile.count({ where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
  const partsPrevious = await prisma.part.count({ where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });

  // 3. Charts: group orders by month+status IN THE DATABASE
  const ordersGrouped = await prisma.$queryRaw`
    SELECT
      TO_CHAR("created_at", 'Mon') AS name,
      EXTRACT(MONTH FROM "created_at")::int AS month_num,
      COUNT(*) FILTER (WHERE status::text IN ('completed', 'delivered'))  AS completed,
      COUNT(*) FILTER (WHERE status::text IN ('pending', 'confirmed', 'processing', 'shipped'))  AS pending,
      COUNT(*) FILTER (WHERE status::text IN ('cancelled', 'refunded'))  AS cancelled
    FROM "orders"
    WHERE "created_at" >= ${startOfYear}
    GROUP BY name, month_num
    ORDER BY month_num
  `;

  // 4. Charts: group appointments by month+status IN THE DATABASE
  const appointmentsGrouped = await prisma.$queryRaw`
    SELECT
      TO_CHAR("created_at", 'Mon') AS name,
      EXTRACT(MONTH FROM "created_at")::int AS month_num,
      COUNT(*) FILTER (WHERE status::text IN ('completed'))  AS completed,
      COUNT(*) FILTER (WHERE status::text IN ('pending', 'confirmed', 'in_progress'))  AS pending,
      COUNT(*) FILTER (WHERE status::text IN ('cancelled'))  AS cancelled
    FROM "appointments"
    WHERE "created_at" >= ${startOfYear}
    GROUP BY name, month_num
    ORDER BY month_num
  `;

  // 5. Recent lists
  const recentClients = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { created_at: "desc" },
    take: 5,
    include: { client_profile: true },
  });
  
  const recentStores = await prisma.storeProfile.findMany({
    orderBy: { created_at: "desc" },
    take: 5,
    include: { user: true },
  });
  
  const recentPros = await prisma.professionalProfile.findMany({
    orderBy: { created_at: "desc" },
    take: 5,
    include: { user: true },
  });

  // ── Compute trends ────────────────────────────────────────────────
  const trend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // ── Normalise raw SQL rows to the frontend chart format ───────────
  // The raw query returns BigInt for COUNT; cast to Number.
  const normaliseChart = (rows) =>
    rows.map((r) => ({
      name: r.name.trim(),
      completed: Number(r.completed),
      pending: Number(r.pending),
      cancelled: Number(r.cancelled),
    }));

  const result = {
    stats: {
      totalClients,
      totalStores,
      totalProfessionals,
      totalParts,
      clientsTrend: trend(clientsCurrent, clientsPrevious),
      storesTrend: trend(storesCurrent, storesPrevious),
      prosTrend: trend(prosCurrent, prosPrevious),
      partsTrend: trend(partsCurrent, partsPrevious),
    },
    charts: {
      orders: normaliseChart(ordersGrouped),
      appointments: normaliseChart(appointmentsGrouped),
    },
    recent: {
      recentClients,
      recentStores,
      recentPros,
    },
  };

  // 2. Store in cache
  setCache(CACHE_KEY, result, CACHE_TTL);
  console.log("[Dashboard] Data cached for", CACHE_TTL, "seconds");

  return result;
}

module.exports = { getDashboardStats, CACHE_KEY };
