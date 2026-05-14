const prisma = require("../prisma/client");

const isAdmin = (user) => user?.role === "admin";
const isCustomer = (user) => user?.role === "customer";
const isStore = (user) => user?.role === "store";

const generateEdahabiaRef = () => {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `EDAH-${Date.now()}-${suffix}`;
};

const getStoreProfileForUser = (userId) =>
  prisma.storeProfile.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

const canAccessOrder = async (user, order) => {
  if (!order) return false;
  if (isAdmin(user)) return true;
  if (isCustomer(user)) return order.customer_id === user.id;

  if (isStore(user)) {
    const storeProfile = await getStoreProfileForUser(user.id);
    return storeProfile?.id === order.store_id;
  }

  return false;
};

/**
 * Initiate a payment for an order owned by the authenticated customer.
 */
const initiatePayment = async (req, res, next) => {
  try {
    if (!isCustomer(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only customers can initiate payments",
      });
    }

    const { order_id, method } = req.body;
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        customer_id: req.user.id,
      },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Payments can only be initiated for pending or confirmed orders",
      });
    }

    if (order.payment?.status === "success") {
      return res.status(409).json({
        success: false,
        message: "Order is already paid",
      });
    }

    const edahabia_ref = method === "edahabia" ? generateEdahabiaRef() : null;
    const payment = await prisma.payment.upsert({
      where: { order_id: order.id },
      update: {
        method,
        amount_dzd: order.total_dzd,
        status: "pending",
        edahabia_ref,
        gateway_response: null,
        failed_reason: null,
        paid_at: null,
      },
      create: {
        order_id: order.id,
        payer_id: req.user.id,
        method,
        amount_dzd: order.total_dzd,
        status: "pending",
        edahabia_ref,
      },
    });

    const data = { payment };

    if (method === "edahabia") {
      data.checkout_url = `https://edahabia.mock/pay?ref=${edahabia_ref}`;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Payment reference already exists",
      });
    }

    next(error);
  }
};

/**
 * Receive a simulated Edahabia payment webhook.
 */
const handleEdahabiaWebhook = async (req, res, next) => {
  try {
    const { edahabia_ref, status, failed_reason } = req.body;
    const payment = await prisma.payment.findUnique({
      where: { edahabia_ref },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "success") {
      return res.json({
        success: true,
        data: { received: true },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          paid_at: status === "success" ? new Date() : null,
          failed_reason: status === "failed" ? failed_reason : null,
          gateway_response: req.body,
        },
      });

      if (status === "success") {
        await tx.order.update({
          where: { id: payment.order_id },
          data: { status: "confirmed" },
        });
      }
    });

    res.json({
      success: true,
      data: { received: true },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    next(error);
  }
};

/**
 * Get the payment for an order visible to the authenticated requester.
 */
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { order_id: req.params.order_id },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const hasAccess = await canAccessOrder(req.user, payment.order);

    if (!hasAccess) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePayment,
  handleEdahabiaWebhook,
  getPaymentByOrder,
};
