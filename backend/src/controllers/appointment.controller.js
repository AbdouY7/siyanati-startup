const prisma = require("../prisma/client");

const appointmentListInclude = {
  customer: {
    select: {
      id: true,
      phone: true,
      client_profile: { select: { full_name: true } },
    },
  },
  professional: {
    select: {
      id: true,
      full_name: true,
      specialty_type: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      brand: { select: { name: true } },
      model: { select: { name: true } },
    },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
    },
  },
};

const appointmentDetailInclude = {
  customer: {
    select: {
      id: true,
      email: true,
      phone: true,
      client_profile: true,
    },
  },
  professional: true,
  vehicle: {
    include: {
      brand: true,
      model: true,
    },
  },
  reviews: {
    include: {
      author: {
        select: {
          id: true,
          client_profile: { select: { full_name: true, avatar_url: true } },
        },
      },
    },
  },
};

const getProfessionalProfile = (userId) =>
  prisma.professionalProfile.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

const getAccessWhere = async (user) => {
  if (user.role === "admin") return {};
  if (user.role === "customer") return { customer_id: user.id };
  if (user.role === "professional") {
    const profile = await getProfessionalProfile(user.id);
    if (!profile) return null;
    return { professional_id: profile.id };
  }
  return null;
};

const createAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { professional_id, vehicle_id, service_type, description, location_address } = req.body;

    if (!professional_id) {
      return res.status(400).json({ success: false, message: "professional_id is required" });
    }
    if (!service_type) {
      return res.status(400).json({ success: false, message: "service_type is required" });
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professional_id },
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }
    if (professional.status !== "approved") {
      return res.status(400).json({ success: false, message: "Professional is not approved" });
    }
    if (professional.is_frozen === true) {
      return res.status(400).json({ success: false, message: "Professional is frozen" });
    }
    if (professional.is_available === false) {
      return res.status(400).json({ success: false, message: "Professional is not available" });
    }

    if (vehicle_id) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle || vehicle.user_id !== req.user.id) {
        return res.status(400).json({ success: false, message: "Vehicle not found" });
      }
    }

    const duplicate = await prisma.appointment.findFirst({
      where: {
        customer_id: req.user.id,
        professional_id: professional_id,
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (duplicate) {
      return res.status(409).json({ success: false, message: "Duplicate active appointment" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customer_id: req.user.id,
        professional_id,
        vehicle_id,
        service_type,
        description,
        location_address,
        status: "pending",
      },
      include: appointmentDetailInclude,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const accessWhere = await getAccessWhere(req.user);
    if (!accessWhere) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, from_date, to_date, page = 1, limit = 10, professional_id } = req.query;

    const where = {
      ...accessWhere,
      ...(status && { status }),
      ...(professional_id && req.user.role === "admin" && { professional_id }),
      ...((from_date || to_date) && {
        created_at: {
          ...(from_date && { gte: new Date(from_date) }),
          ...(to_date && { lte: new Date(to_date) }),
        },
      }),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const appointments = await prisma.appointment.findMany({
      where,
      include: appointmentListInclude,
      orderBy: { created_at: "desc" },
      skip,
      take,
    });
    const total = await prisma.appointment.count({ where });

    res.json({
      success: true,
      data: {
        appointments,
        total,
        page: Number(page),
        limit: take,
        total_pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const accessWhere = await getAccessWhere(req.user);
    if (!accessWhere) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        ...accessWhere,
      },
      include: appointmentDetailInclude,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const confirmAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const profile = await getProfessionalProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment || appointment.professional_id !== profile.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    const { scheduled_at, duration_minutes, quoted_price_dzd, confirmation_note } = req.body;

    if (!scheduled_at || duration_minutes === undefined || quoted_price_dzd === undefined) {
      return res.status(400).json({ success: false, message: "scheduled_at, duration_minutes, and quoted_price_dzd are required" });
    }

    const scheduleDate = new Date(scheduled_at);
    if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
      return res.status(400).json({ success: false, message: "scheduled_at must be a future datetime" });
    }

    if (!Number.isInteger(Number(duration_minutes)) || Number(duration_minutes) <= 0) {
      return res.status(400).json({ success: false, message: "duration_minutes must be a positive int" });
    }

    if (Number(quoted_price_dzd) <= 0) {
      return res.status(400).json({ success: false, message: "quoted_price_dzd must be a positive number" });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "confirmed",
        scheduled_at: scheduleDate,
        duration_minutes: Number(duration_minutes),
        quoted_price_dzd: Number(quoted_price_dzd),
        confirmation_note,
      },
      include: appointmentDetailInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    next(error);
  }
};

const startAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const profile = await getProfessionalProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment || appointment.professional_id !== profile.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "in_progress" },
      include: appointmentDetailInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    next(error);
  }
};

const completeAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const profile = await getProfessionalProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Professional profile not found" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment || appointment.professional_id !== profile.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    const { final_price_dzd, payment_collected, completion_notes } = req.body;

    if (final_price_dzd === undefined || Number(final_price_dzd) <= 0) {
      return res.status(400).json({ success: false, message: "final_price_dzd is required and must be positive" });
    }

    const isPaymentCollected = payment_collected ?? false;

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "completed",
        final_price_dzd: Number(final_price_dzd),
        payment_collected: isPaymentCollected,
        payment_collected_at: isPaymentCollected ? new Date() : null,
        completion_notes,
        completed_at: new Date(),
      },
      include: appointmentDetailInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    if (req.user.role === "admin" || req.user.role === "store") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    let queryWhere = { id: req.params.id };

    if (req.user.role === "customer") {
      queryWhere.customer_id = req.user.id;
    } else if (req.user.role === "professional") {
      const profile = await getProfessionalProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ success: false, message: "Professional profile not found" });
      }
      queryWhere.professional_id = profile.id;
    }

    const appointment = await prisma.appointment.findFirst({
      where: queryWhere,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "pending" && appointment.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "This appointment cannot be cancelled" });
    }

    const { cancellation_reason } = req.body;

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "cancelled",
        cancelled_by: req.user.id,
        cancelled_at: new Date(),
        cancellation_reason,
      },
      include: appointmentDetailInclude,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
};
