const prisma = require("../prisma/client");

// ─── GET /payment-accounts ───────────────────────────────────

const getUserPaymentAccounts = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { user_id },
    });

    if (!clientProfile) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const accounts = await prisma.paymentAccount.findMany({
      where: {
        client_id: clientProfile.id,
        is_active: true,
      },
      orderBy: {
        is_default: "desc",
      },
    });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment-accounts ──────────────────────────────────

const createPaymentAccount = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { account_name, ccp_code, ccp_key, full_name } = req.body;

    if (!ccp_code || !ccp_key || !full_name) {
      return res.status(400).json({
        success: false,
        message: "CCP code, key, and full name are required",
      });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { user_id },
    });

    if (!clientProfile) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const existingCount = await prisma.paymentAccount.count({
      where: { client_id: clientProfile.id, is_active: true },
    });

    const account = await prisma.paymentAccount.create({
      data: {
        client_id: clientProfile.id,
        account_name: account_name || "Compte CCP",
        ccp_code,
        ccp_key,
        full_name,
        is_default: existingCount === 0,
        is_active: true,
      },
    });

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A payment account with this CCP code already exists",
      });
    }
    next(error);
  }
};

// ─── PATCH /payment-accounts/:id ─────────────────────────────

const updatePaymentAccount = async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { user_id },
    });

    if (!clientProfile) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const existing = await prisma.paymentAccount.findFirst({
      where: {
        id,
        client_id: clientProfile.id,
        is_active: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payment account not found",
      });
    }

    const { account_name, ccp_code, ccp_key, full_name, is_default } = req.body;

    if (is_default === true) {
      await prisma.paymentAccount.updateMany({
        where: {
          client_id: clientProfile.id,
          is_default: true,
          NOT: { id },
        },
        data: { is_default: false },
      });
    }

    const account = await prisma.paymentAccount.update({
      where: { id },
      data: {
        ...(account_name && { account_name }),
        ...(ccp_code && { ccp_code }),
        ...(ccp_key && { ccp_key }),
        ...(full_name && { full_name }),
        ...(is_default !== undefined && { is_default }),
      },
    });

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A payment account with this CCP code already exists",
      });
    }
    next(error);
  }
};

// ─── DELETE /payment-accounts/:id ────────────────────────────

const deletePaymentAccount = async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { user_id },
    });

    if (!clientProfile) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    const existing = await prisma.paymentAccount.findFirst({
      where: {
        id,
        client_id: clientProfile.id,
        is_active: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payment account not found",
      });
    }

    await prisma.paymentAccount.update({
      where: { id },
      data: { is_active: false, is_default: false },
    });

    if (existing.is_default) {
      const another = await prisma.paymentAccount.findFirst({
        where: { client_id: clientProfile.id, is_active: true },
        orderBy: { created_at: "asc" },
      });

      if (another) {
        await prisma.paymentAccount.update({
          where: { id: another.id },
          data: { is_default: true },
        });
      }
    }

    res.json({
      success: true,
      message: "Payment account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
};