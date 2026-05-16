const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
} = require("../controllers/report.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createReport);
router.get("/", getReports);
router.get("/:id", getReportById);
router.patch("/:id", updateReport);

module.exports = router;
