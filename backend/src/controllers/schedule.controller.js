const prisma = require("../prisma/client");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const checkOwnership = async (req, professionalId) => {
  if (!req.user) return false;
  if (req.user.professional_profile_id) {
    return req.user.professional_profile_id === professionalId;
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { user_id: req.user.id },
    select: { id: true },
  });
  return profile && profile.id === professionalId;
};

const getProfileIdForUser = async (userId) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

  return profile?.id;
};

const getCurrentProfessionalId = async (req) => {
  if (req.user?.professional_profile_id) {
    return req.user.professional_profile_id;
  }

  const existingProfileId = await getProfileIdForUser(req.user.id);
  if (existingProfileId) return existingProfileId;

  if (req.user.role !== "professional") return null;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, phone: true },
  });

  if (!user) return null;

  const fullName = user.email?.split("@")[0] || user.phone || "Professionnel";

  const profile = await prisma.professionalProfile.create({
    data: {
      user_id: user.id,
      full_name: fullName,
      specialty_type: "other",
      wilaya: "Non renseignee",
      documents: [],
      status: "approved",
      is_available: false,
    },
    select: { id: true },
  });

  req.user.professional_profile_id = profile.id;
  return profile.id;
};

const resolveProfessionalId = async (value) => {
  if (!value) return null;

  const profile = await prisma.professionalProfile.findFirst({
    where: {
      OR: [{ id: value }, { user_id: value }],
    },
    select: { id: true },
  });

  return profile?.id;
};

const getSchedulePayload = async (professionalId) => {
    const [profile, schedules, exceptions] = await Promise.all([
      prisma.professionalProfile.findUnique({
        where: { id: professionalId },
        select: { id: true, is_available: true },
      }),
      prisma.professionalSchedule.findMany({
        where: { professional_id: professionalId },
        orderBy: { day_of_week: "asc" },
      }),
      prisma.professionalScheduleException.findMany({
        where: { professional_id: professionalId },
        orderBy: { exception_date: "asc" },
      }),
    ]);

  if (!profile) return null;

  return { schedules, exceptions, is_available: profile.is_available };
};

const getProfessionalSchedule = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const resolvedProfessionalId = await resolveProfessionalId(professionalId);

    if (!resolvedProfessionalId) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const data = await getSchedulePayload(resolvedProfessionalId);

    if (!data) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyProfessionalSchedule = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const professionalId = await getCurrentProfessionalId(req);
    if (!professionalId) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const data = await getSchedulePayload(professionalId);
    res.json({ success: true, data: { ...data, professional_id: professionalId } });
  } catch (error) {
    next(error);
  }
};

const validateScheduleEntry = (entry) => {
  const { day_of_week, start_time, end_time, slot_duration_minutes = 60, is_active = true } = entry;

  if (!Number.isInteger(day_of_week) || day_of_week < 0 || day_of_week > 6) {
    return "day_of_week must be an integer between 0 and 6 inclusive";
  }

  if (!TIME_REGEX.test(start_time) || !TIME_REGEX.test(end_time)) {
    return "start_time and end_time must be in HH:MM format";
  }

  if (end_time <= start_time) {
    return "end_time must be after start_time";
  }

  if (!Number.isInteger(slot_duration_minutes) || slot_duration_minutes < 15 || slot_duration_minutes > 240) {
    return "slot_duration_minutes must be an integer between 15 and 240";
  }

  if (typeof is_active !== "boolean") {
    return "is_active must be a boolean";
  }

  return null;
};

const replaceWeeklySchedule = async (req, res, next) => {
  try {
    let { professionalId } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found for current user" });
      }
    } else {
      professionalId = await resolveProfessionalId(professionalId);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found" });
      }
    }

    const isOwner = await checkOwnership(req, professionalId);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { schedules = [] } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ success: false, message: "schedules must be an array" });
    }

    const seenDays = new Set();
    for (const entry of schedules) {
      const error = validateScheduleEntry(entry);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }
      if (seenDays.has(entry.day_of_week)) {
        return res.status(400).json({ success: false, message: "Each day can only have one schedule" });
      }
      seenDays.add(entry.day_of_week);
    }

    const isAvailable = schedules.some((entry) => entry.is_active !== false);

    const result = await prisma.$transaction(async (tx) => {
      await tx.professionalSchedule.deleteMany({
        where: { professional_id: professionalId },
      });

      if (schedules.length > 0) {
        await tx.professionalSchedule.createMany({
          data: schedules.map((entry) => ({
            professional_id: professionalId,
            day_of_week: entry.day_of_week,
            start_time: entry.start_time,
            end_time: entry.end_time,
            slot_duration_minutes: entry.slot_duration_minutes || 60,
            is_active: entry.is_active !== false,
          })),
        });
      }

      await tx.professionalProfile.update({
        where: { id: professionalId },
        data: { is_available: isAvailable },
      });

      const [updatedSchedules, exceptions] = await Promise.all([
        tx.professionalSchedule.findMany({
          where: { professional_id: professionalId },
          orderBy: { day_of_week: "asc" },
        }),
        tx.professionalScheduleException.findMany({
          where: { professional_id: professionalId },
          orderBy: { exception_date: "asc" },
        }),
      ]);

      return { schedules: updatedSchedules, exceptions, is_available: isAvailable };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    let { professionalId } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
    } else {
      professionalId = await resolveProfessionalId(professionalId);
    }

    if (!professionalId) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

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
    let { professionalId, id } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
    } else {
      professionalId = await resolveProfessionalId(professionalId);
    }

    if (!professionalId) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

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
    let { professionalId, id } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
    } else {
      professionalId = await resolveProfessionalId(professionalId);
    }

    if (!professionalId) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

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
    let { professionalId } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found for current user" });
      }
    } else {
      professionalId = await resolveProfessionalId(professionalId);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found" });
      }
    }

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
    let { professionalId, id } = req.params;

    if (professionalId === "me") {
      professionalId = await getCurrentProfessionalId(req);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found for current user" });
      }
    } else {
      professionalId = await resolveProfessionalId(professionalId);
      if (!professionalId) {
        return res.status(404).json({ success: false, message: "Professional profile not found" });
      }
    }

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
  getMyProfessionalSchedule,
  replaceWeeklySchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createScheduleException,
  deleteScheduleException,
};
