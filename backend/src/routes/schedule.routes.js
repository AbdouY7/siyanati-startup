const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProfessionalSchedule,
  getMyProfessionalSchedule,
  replaceWeeklySchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createScheduleException,
  deleteScheduleException,
} = require("../controllers/schedule.controller");

const router = express.Router();

router.get("/me/schedule", authMiddleware, getMyProfessionalSchedule);
router.get("/:professionalId/schedule", getProfessionalSchedule);

router.use(authMiddleware);

router.put("/:professionalId/schedule", replaceWeeklySchedule);
router.post("/:professionalId/schedule", createSchedule);
router.patch("/:professionalId/schedule/:id", updateSchedule);
router.delete("/:professionalId/schedule/:id", deleteSchedule);

router.post("/:professionalId/schedule/exceptions", createScheduleException);
router.delete("/:professionalId/schedule/exceptions/:id", deleteScheduleException);

module.exports = router;
