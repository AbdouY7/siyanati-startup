const prisma = require("../prisma/client");

const isAdmin = (user) => user?.role === "admin";
const isCustomer = (user) => user?.role === "customer";
const isStore = (user) => user?.role === "store";

const generateEdahabiaRef = () => {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `EDAH-${Date.now()}-${suffix}`;
};

const { resolveSubscriber } = require("./subscription.controller");

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
 * Initiate a payment for an appointment.
 */
const initiateAppointmentPayment = async (req, res, next) => {
  try {
    if (!isCustomer(req.user)) {
      return res.status(403).json({ success: false, message: "Only customers can initiate payments" });
    }

    const { appointment_id, method } = req.body;
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointment_id, customer_id: req.user.id },
      include: { payment: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed appointments can be paid" });
    }

    if (appointment.payment?.status === "success" || appointment.payment_collected) {
      return res.status(409).json({ success: false, message: "Appointment is already paid" });
    }

    if (!appointment.final_price_dzd) {
      return res.status(400).json({ success: false, message: "Appointment final price is not set" });
    }

    const edahabia_ref = method === "edahabia" ? generateEdahabiaRef() : null;
    const payment = await prisma.payment.upsert({
      where: { appointment_id: appointment.id },
      update: {
        method,
        amount_dzd: appointment.final_price_dzd,
        status: "pending",
        edahabia_ref,
        gateway_response: null,
        failed_reason: null,
        paid_at: null,
      },
      create: {
        appointment_id: appointment.id,
        payer_id: req.user.id,
        method,
        amount_dzd: appointment.final_price_dzd,
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
      return res.status(409).json({ success: false, message: "Payment reference already exists" });
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
      include: { order: true, appointment: true },
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
        if (payment.order_id) {
          await tx.order.update({
            where: { id: payment.order_id },
            data: { status: "confirmed" },
          });
        } else if (payment.appointment_id) {
          await tx.appointment.update({
            where: { id: payment.appointment_id },
            data: { payment_collected: true, payment_collected_at: new Date() },
          });
        }
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

/**
 * Collect cash on delivery payment.
 */
const collectCodPayment = async (req, res, next) => {
  try {
    const isProf = req.user?.role === "professional";
    if (!isAdmin(req.user) && !isStore(req.user) && !isProf) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to collect payments",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { order: true, appointment: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (isStore(req.user)) {
      const storeProfile = await getStoreProfileForUser(req.user.id);
      if (!storeProfile || !payment.order || storeProfile.id !== payment.order.store_id) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }
    }

    if (isProf) {
      const profProfile = await prisma.professionalProfile.findUnique({ where: { user_id: req.user.id } });
      if (!profProfile || !payment.appointment || profProfile.id !== payment.appointment.professional_id) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }
    }

    if (payment.method !== "cash_on_delivery") {
      return res.status(400).json({
        success: false,
        message: "Payment method is not cash on delivery",
      });
    }

    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been collected",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "success",
        paid_at: new Date(),
      },
    });

    res.json({ success: true, data: updatedPayment });
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
 * Get payment by ID.
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
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

/**
 * Admin update payment status.
 */
const adminUpdatePaymentStatus = async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update payment status",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const { status, failed_reason } = req.body;
    let updatedPayment;

    if (status === "refunded") {
      updatedPayment = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.update({
          where: { id: payment.id },
          data: { status },
        });

        await tx.order.update({
          where: { id: payment.order_id },
          data: { status: "refunded" },
        });

        return p;
      });
    } else {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          paid_at: status === "success" ? new Date() : payment.paid_at,
          failed_reason: status === "failed" ? failed_reason : payment.failed_reason,
        },
      });
    }

    res.json({ success: true, data: updatedPayment });
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
 * Initiate payment for a subscription.
 */
const initiateSubscriptionPayment = async (req, res, next) => {
  try {
    const { subscription_id, method } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscription_id },
      include: { plan: true, payment: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const subscriber = await resolveSubscriber(req.user.id);
    if (!subscriber || subscriber.subscriber_id !== subscription.subscriber_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (subscription.status === "active") {
      return res.status(400).json({ success: false, message: "Subscription is already active" });
    }

    const edahabia_ref = method === "edahabia" ? generateEdahabiaRef() : null;

    const payment = await prisma.payment.upsert({
      where: { subscription_id: subscription.id },
      update: {
        method,
        amount_dzd: subscription.plan.price_dzd,
        status: "pending",
        edahabia_ref,
        gateway_response: null,
        failed_reason: null,
        paid_at: null,
      },
      create: {
        subscription_id: subscription.id,
        payer_id: req.user.id,
        method,
        amount_dzd: subscription.plan.price_dzd,
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
      return res.status(409).json({ success: false, message: "Payment reference already exists" });
    }
    next(error);
  }
};

/**
 * Handle subscription payment webhook.
 */
const handleSubscriptionPaymentWebhook = async (req, res, next) => {
  try {
    const { edahabia_ref, status, failed_reason } = req.body;
    
    // We find First since edahabia_ref is not marked unique in schema directly although logically it is
    const payment = await prisma.payment.findFirst({
      where: { edahabia_ref, subscription_id: { not: null } },
      include: { subscription: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "success") {
      return res.json({ success: true, data: { received: true } });
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
        await tx.subscription.update({
          where: { id: payment.subscription_id },
          data: { status: "active" },
        });

        if (payment.subscription.subscriber_type === "store") {
          await tx.storeProfile.update({
            where: { id: payment.subscription.subscriber_id },
            data: { is_frozen: false },
          });
        } else if (payment.subscription.subscriber_type === "professional") {
          await tx.professionalProfile.update({
            where: { id: payment.subscription.subscriber_id },
            data: { is_frozen: false },
          });
        }
      }
    });

    res.json({ success: true, data: { received: true } });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    next(error);
  }
};

module.exports = {
  initiatePayment,
  handleEdahabiaWebhook,
  getPaymentByOrder,
  collectCodPayment,
  getPaymentById,
  adminUpdatePaymentStatus,
  initiateSubscriptionPayment,
  handleSubscriptionPaymentWebhook,
  initiateAppointmentPayment,
};
