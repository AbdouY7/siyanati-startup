const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProfessionalSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createScheduleException,
  deleteScheduleException,
} = require("../controllers/schedule.controller");

const router = express.Router();

router.get("/:professionalId/schedule", getProfessionalSchedule);

router.use(authMiddleware);

router.post("/:professionalId/schedule", createSchedule);
router.patch("/:professionalId/schedule/:id", updateSchedule);
router.delete("/:professionalId/schedule/:id", deleteSchedule);

router.post("/:professionalId/schedule/exceptions", createScheduleException);
router.delete("/:professionalId/schedule/exceptions/:id", deleteScheduleException);

module.exports = router;
