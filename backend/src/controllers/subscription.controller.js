const prisma = require("../prisma/client");

const isSubscriptionsEnabled = async () => {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: "subscriptions_enabled" }
  });
  return setting?.value === true;
};

const resolveSubscriber = async (userId) => {
  const store = await prisma.storeProfile.findUnique({ where: { user_id: userId } });
  if (store) return { subscriber_id: store.id, subscriber_type: "store", status: store.status };

  const pro = await prisma.professionalProfile.findUnique({ where: { user_id: userId } });
  if (pro) return { subscriber_id: pro.id, subscriber_type: "professional", status: pro.status };

  return null;
};

const setProfileFrozen = async (subscriberType, subscriberId, isFrozen) => {
  if (subscriberType === "store") {
    await prisma.storeProfile.update({ where: { id: subscriberId }, data: { is_frozen: isFrozen } });
  } else if (subscriberType === "professional") {
    await prisma.professionalProfile.update({ where: { id: subscriberId }, data: { is_frozen: isFrozen } });
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const enabled = await isSubscriptionsEnabled();
    if (!enabled) return res.status(400).json({ success: false, message: "Subscriptions are disabled" });

    const subscriber = await resolveSubscriber(req.user.id);
    if (!subscriber) return res.status(403).json({ success: false, message: "Only stores and professionals can subscribe" });

    if (subscriber.status !== "approved") {
      return res.status(400).json({ success: false, message: "Profile must be approved to subscribe" });
    }

    const { plan_id } = req.body;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: plan_id } });

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    if (!plan.is_active) return res.status(400).json({ success: false, message: "Plan is not active" });
    if (plan.target_type !== subscriber.subscriber_type) {
      return res.status(400).json({ success: false, message: "Plan target type does not match your profile" });
    }

    const activeSub = await prisma.subscription.findFirst({
      where: { subscriber_id: subscriber.subscriber_id, status: "active" }
    });
    if (activeSub) return res.status(409).json({ success: false, message: "You already have an active subscription" });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (plan.is_free_trial ? plan.trial_days : plan.duration_days));

    if (plan.is_free_trial) {
      const subscription = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: {
            subscriber_id: subscriber.subscriber_id,
            subscriber_type: subscriber.subscriber_type,
            plan_id: plan.id,
            status: "active",
            is_trial: true,
            started_at: now,
            expires_at: expiresAt
          }
        });
        
        if (subscriber.subscriber_type === "store") {
          await tx.storeProfile.update({ where: { id: subscriber.subscriber_id }, data: { is_frozen: false } });
        } else {
          await tx.professionalProfile.update({ where: { id: subscriber.subscriber_id }, data: { is_frozen: false } });
        }
        
        return sub;
      });
      return res.status(201).json({ success: true, data: subscription });
    } else {
      const suffix = Math.floor(100000 + Math.random() * 900000);
      const ref = `EDAH-${Date.now()}-${suffix}`;

      const subscription = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: {
            subscriber_id: subscriber.subscriber_id,
            subscriber_type: subscriber.subscriber_type,
            plan_id: plan.id,
            status: "pending",
            is_trial: false,
            started_at: now,
            expires_at: expiresAt
          }
        });

        await tx.payment.create({
          data: {
            subscription_id: sub.id,
            payer_id: req.user.id,
            method: "edahabia",
            amount_dzd: plan.price_dzd,
            status: "pending",
            edahabia_ref: ref
          }
        });

        return sub;
      });

      return res.status(201).json({ success: true, data: subscription });
    }
  } catch (error) {
    next(error);
  }
};

const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriber = await resolveSubscriber(req.user.id);
    if (!subscriber) return res.status(403).json({ success: false, message: "Forbidden" });

    const subs = await prisma.subscription.findMany({
      where: { subscriber_id: subscriber.subscriber_id },
      orderBy: { created_at: "desc" },
      include: { plan: true, payment: true }
    });

    res.json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
};

const getMyActiveSubscription = async (req, res, next) => {
  try {
    const subscriber = await resolveSubscriber(req.user.id);
    if (!subscriber) return res.status(403).json({ success: false, message: "Forbidden" });

    const sub = await prisma.subscription.findFirst({
      where: { subscriber_id: subscriber.subscriber_id, status: "active" },
      include: { plan: true }
    });

    if (!sub) return res.status(404).json({ success: false, message: "No active subscription" });
    res.json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};

const getAllSubscriptions = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const subs = await prisma.subscription.findMany({
      orderBy: { created_at: "desc" },
      include: { plan: true }
    });

    res.json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionById = async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { id: req.params.id },
      include: { plan: true }
    });
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });

    if (req.user.role !== "admin") {
      const subscriber = await resolveSubscriber(req.user.id);
      if (!subscriber || subscriber.subscriber_id !== sub.subscriber_id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    res.json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const subscriber = await resolveSubscriber(req.user.id);
    if (!subscriber) return res.status(403).json({ success: false, message: "Forbidden" });

    const sub = await prisma.subscription.findFirst({
      where: { subscriber_id: subscriber.subscriber_id, status: "active" }
    });

    if (!sub) return res.status(404).json({ success: false, message: "No active subscription found" });

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "cancelled",
        auto_renew: false,
        cancelled_at: new Date()
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const suspendSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const sub = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: "expired" }
    });

    await setProfileFrozen(sub.subscriber_type, sub.subscriber_id, true);

    res.json({ success: true, data: sub });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Subscription not found" });
    next(error);
  }
};

const reactivateSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const sub = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: "active" }
    });

    await setProfileFrozen(sub.subscriber_type, sub.subscriber_id, false);

    res.json({ success: true, data: sub });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Subscription not found" });
    next(error);
  }
};

const getPlatformSettings = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });
    const settings = await prisma.platformSetting.findMany();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updatePlatformSetting = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await prisma.platformSetting.upsert({
      where: { key },
      update: { value, description, updated_by_admin_id: req.user.id },
      create: { key, value, description, updated_by_admin_id: req.user.id }
    });

    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isSubscriptionsEnabled,
  resolveSubscriber,
  setProfileFrozen,
  createSubscription,
  getMySubscriptions,
  getMyActiveSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  cancelSubscription,
  suspendSubscription,
  reactivateSubscription,
  getPlatformSettings,
  updatePlatformSetting
};
