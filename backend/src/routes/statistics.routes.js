const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getUserStatistics } = require("../controllers/statistics.controller");

const router = express.Router();

router.use(authMiddleware);

// GET /api/statistics/user
router.get("/user", getUserStatistics);

module.exports = router;
