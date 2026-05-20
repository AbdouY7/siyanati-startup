/**
 * Admin Dashboard Controller
 * ─────────────────────────────────────────────────────────────────────
 * Thin controller layer — all DB logic lives in services/stats.service.js
 */
const { getDashboardStats, CACHE_KEY } = require("../services/stats.service");
const { clearCache } = require("../utils/cache");

// GET /api/admin/dashboard/overview
const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getDashboardOverview:", error);
    next(error);
  }
};

// POST /api/admin/dashboard/refresh  — busts cache and returns fresh data
const refreshDashboard = async (req, res, next) => {
  try {
    clearCache(CACHE_KEY);
    console.log("[Dashboard] Cache cleared via manual refresh");
    const data = await getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in refreshDashboard:", error);
    next(error);
  }
};

module.exports = { getDashboardOverview, refreshDashboard };
