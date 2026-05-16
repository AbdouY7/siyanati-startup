const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
} = require("../controllers/appointment.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);

router.patch("/:id/confirm", confirmAppointment);
router.patch("/:id/start", startAppointment);
router.patch("/:id/complete", completeAppointment);
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;
