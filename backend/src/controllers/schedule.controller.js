const prisma = require("../prisma/client");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const checkOwnership = async (req, professionalId) => {
  if (!req.user) return false;
  const profile = await prisma.professionalProfile.findUnique({
    where: { user_id: req.user.id },
    select: { id: true },
  });
  return profile && profile.id === professionalId;
};

const getProfessionalSchedule = async (req, res, next) => {
  try {
    const { professionalId } = req.params;

    const [schedules, exceptions] = await Promise.all([
      prisma.professionalSchedule.findMany({
        where: { professional_id: professionalId },
      }),
      prisma.professionalScheduleException.findMany({
        where: { professional_id: professionalId },
      }),
    ]);

    res.json({
      success: true,
      data: { schedules, exceptions },
    });
  } catch (error) {
    next(error);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const { professionalId } = req.params;

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { day_of_week, start_time, end_time, slot_duration_minutes } = req.body;

    if (!Number.isInteger(day_of_week) || day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({ success: false, message: "day_of_week must be an integer between 0 and 6 inclusive" });
    }

    if (!TIME_REGEX.test(start_time) || !TIME_REGEX.test(end_time)) {
      return res.status(400).json({ success: false, message: "start_time and end_time must be in HH:MM format" });
    }

    if (end_time <= start_time) {
      return res.status(400).json({ success: false, message: "end_time must be after start_time" });
    }

    const existing = await prisma.professionalSchedule.findFirst({
      where: { professional_id: professionalId, day_of_week },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Schedule for this day already exists" });
    }

    const schedule = await prisma.professionalSchedule.create({
      data: {
        professional_id: professionalId,
        day_of_week,
        start_time,
        end_time,
        slot_duration_minutes: slot_duration_minutes || 60,
      },
    });

    res.json({ success: true, data: schedule });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Schedule for this day already exists" });
    }
    next(error);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const { professionalId, id } = req.params;

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { start_time, end_time, slot_duration_minutes, is_active } = req.body;

    if (start_time !== undefined && !TIME_REGEX.test(start_time)) {
       return res.status(400).json({ success: false, message: "start_time must be in HH:MM format" });
    }
    if (end_time !== undefined && !TIME_REGEX.test(end_time)) {
       return res.status(400).json({ success: false, message: "end_time must be in HH:MM format" });
    }

    const scheduleToUpdate = await prisma.professionalSchedule.findUnique({
      where: { id },
    });

    if (!scheduleToUpdate || scheduleToUpdate.professional_id !== professionalId) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const newStartTime = start_time !== undefined ? start_time : scheduleToUpdate.start_time;
    const newEndTime = end_time !== undefined ? end_time : scheduleToUpdate.end_time;

    if (newEndTime <= newStartTime) {
      return res.status(400).json({ success: false, message: "end_time must be after start_time" });
    }

    const updated = await prisma.professionalSchedule.update({
      where: { id },
      data: {
        start_time,
        end_time,
        slot_duration_minutes,
        is_active,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    next(error);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const { professionalId, id } = req.params;

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const schedule = await prisma.professionalSchedule.findUnique({
      where: { id },
    });

    if (!schedule || schedule.professional_id !== professionalId) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    await prisma.professionalSchedule.delete({
      where: { id },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    next(error);
  }
};

const createScheduleException = async (req, res, next) => {
  try {
    const { professionalId } = req.params;

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { exception_date, is_day_off = true, start_time, end_time, reason } = req.body;

    const parsedDate = new Date(exception_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid exception date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exDate = new Date(parsedDate);
    exDate.setHours(0, 0, 0, 0);

    if (exDate < today) {
      return res.status(400).json({ success: false, message: "Exception date cannot be in the past" });
    }

    if (!is_day_off) {
      if (!start_time || !end_time) {
        return res.status(400).json({ success: false, message: "start_time and end_time are required when is_day_off is false" });
      }

      if (!TIME_REGEX.test(start_time) || !TIME_REGEX.test(end_time)) {
        return res.status(400).json({ success: false, message: "start_time and end_time must be in HH:MM format" });
      }

      if (end_time <= start_time) {
        return res.status(400).json({ success: false, message: "end_time must be after start_time" });
      }
    }

    const exception = await prisma.professionalScheduleException.create({
      data: {
        professional_id: professionalId,
        exception_date: parsedDate,
        is_day_off,
        start_time: is_day_off ? null : start_time,
        end_time: is_day_off ? null : end_time,
        reason,
      },
    });

    res.json({ success: true, data: exception });
  } catch (error) {
    next(error);
  }
};

const deleteScheduleException = async (req, res, next) => {
  try {
    const { professionalId, id } = req.params;

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const exception = await prisma.professionalScheduleException.findUnique({
      where: { id },
    });

    if (!exception || exception.professional_id !== professionalId) {
      return res.status(404).json({ success: false, message: "Exception not found" });
    }

    await prisma.professionalScheduleException.delete({
      where: { id },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Exception not found" });
    }
    next(error);
  }
};

module.exports = {
  getProfessionalSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createScheduleException,
  deleteScheduleException,
};
