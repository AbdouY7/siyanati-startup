const prisma = require("../prisma/client");

const reportListInclude = {
  reporter: {
    select: { id: true, email: true },
  },
};

const createReport = async (req, res, next) => {
  try {
    const { target_id, target_type, reason, description } = req.body;

    const validTargetTypes = ["store", "professional", "post", "comment", "user"];
    const validReasons = ["spam", "fraud", "inappropriate_content", "fake_parts", "no_show", "other"];

    if (!validTargetTypes.includes(target_type)) {
      return res.status(400).json({ success: false, message: "Invalid target_type" });
    }

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: "Invalid reason" });
    }

    if (target_type === "user" && target_id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot report yourself" });
    }

    const existing = await prisma.report.findFirst({
      where: {
        reporter_id: req.user.id,
        target_id,
        target_type,
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reported this" });
    }

    const report = await prisma.report.create({
      data: {
        reporter_id: req.user.id,
        target_id,
        target_type,
        reason,
        description,
        status: "pending",
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, target_type, page = 1, limit = 10 } = req.query;

    const where = {
      ...(status && { status }),
      ...(target_type && { target_type }),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        include: reportListInclude,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        reports,
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

const getReportById = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: reportListInclude,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, admin_notes } = req.body;

    const validStatuses = ["reviewed", "dismissed", "actioned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        admin_notes,
        reviewed_by_admin_id: req.user.id,
        reviewed_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
};
