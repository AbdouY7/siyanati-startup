const prisma = require("../prisma/client");
const { notifyUser, notifyAdmins } = require("../services/notification.service");

const reportListInclude = {
  reporter: {
    select: { id: true, email: true },
  },
};

const createReport = async (req, res, next) => {
  try {
    const { target_id, target_type, reason, description, conversation_id } = req.body;

    const validTargetTypes = ["store", "professional", "post", "comment", "user", "conversation"];
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
        conversation_id,
        status: "pending",
      },
    });

    // Notify all admins about the new report
    notifyAdmins(
      "new_report",
      "Nouveau signalement",
      `Un signalement de type "${reason}" a été soumis concernant un(e) ${target_type}.`,
      report.id
    );

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

    const [reports, total] = await Promise.all([
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

    if (status === "actioned" || status === "dismissed") {
      // Notify the reporter that their report was reviewed
      notifyUser(
        updated.reporter_id,
        "report_reviewed",
        "Signalement traité",
        `Votre signalement a été examiné par un administrateur. Résultat: ${status === "actioned" ? "Action prise" : "Rejeté"}. Note: ${admin_notes || "Aucune note additionnelle."}`,
        updated.id
      );

      if (status === "actioned") {
        let reportedUserId = null;
        if (updated.target_type === "user") {
          reportedUserId = updated.target_id;
        } else if (updated.target_type === "store") {
          const store = await prisma.storeProfile.findFirst({ where: { id: updated.target_id } });
          if (store) reportedUserId = store.user_id;
        } else if (updated.target_type === "professional") {
          const pro = await prisma.professionalProfile.findFirst({ where: { id: updated.target_id } });
          if (pro) reportedUserId = pro.user_id;
        } else if (updated.target_type === "post") {
          const post = await prisma.diagnosticPost.findFirst({ where: { id: updated.target_id } });
          if (post) reportedUserId = post.author_id;
        } else if (updated.target_type === "comment") {
          const comment = await prisma.diagnosticComment.findFirst({ where: { id: updated.target_id } });
          if (comment) reportedUserId = comment.author_id;
        }

        if (reportedUserId) {
          notifyUser(
            reportedUserId,
            "admin_signal_response",
            "Action de modération",
            `Un signalement vous concernant ou concernant votre contenu a été validé par l'administration. Note: ${admin_notes || "Veuillez respecter les règles de la plateforme."}`,
            updated.id
          );
        }
      }
    }

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
