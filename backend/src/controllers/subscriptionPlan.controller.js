const prisma = require("../prisma/client");

const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { price_dzd: "asc" }
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionPlanById = async (req, res, next) => {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: req.params.id }
    });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const createSubscriptionPlan = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    let { name, description, price_dzd, billing_cycle, duration_days, target_type, features, is_free_trial, trial_days } = req.body;

    if (billing_cycle === "yearly") {
      billing_cycle = "annual";
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price_dzd: is_free_trial ? 0 : Number(price_dzd),
        billing_cycle,
        duration_days: Number(duration_days),
        target_type,
        features: features || null,
        is_free_trial: Boolean(is_free_trial),
        trial_days: is_free_trial ? Number(trial_days) : null,
        is_active: true
      }
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionPlan = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const updateData = { ...req.body };
    if (updateData.billing_cycle === "yearly") {
      updateData.billing_cycle = "annual";
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Plan not found" });
    next(error);
  }
};

const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: req.params.id },
      include: { subscriptions: { where: { status: "active" }, take: 1 } }
    });

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    if (plan.subscriptions.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete plan with active subscriptions" });
    }

    await prisma.subscriptionPlan.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Plan not found" });
    next(error);
  }
};

module.exports = {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
};
