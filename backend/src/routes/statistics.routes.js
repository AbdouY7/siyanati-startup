const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getUserStatistics,
  getProfessionalDashboardStats,
  getStoreDashboardStats,
  toggleProfessionalAvailability,
} = require("../controllers/statistics.controller");

const router = express.Router();

router.use(authMiddleware);

// GET /api/statistics/user
router.get("/user", getUserStatistics);

// GET /api/statistics/professional-dashboard
router.get("/professional-dashboard", getProfessionalDashboardStats);

// GET /api/statistics/store-dashboard
router.get("/store-dashboard", getStoreDashboardStats);

// PATCH /api/statistics/professional-availability
router.patch("/professional-availability", toggleProfessionalAvailability);

module.exports = router;
