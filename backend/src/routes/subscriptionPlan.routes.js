const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} = require("../controllers/subscriptionPlan.controller");

const router = express.Router();

router.get("/subscription-plans", getSubscriptionPlans);
router.get("/subscription-plans/:id", getSubscriptionPlanById);

router.post("/subscription-plans", authMiddleware, createSubscriptionPlan);
router.patch("/subscription-plans/:id", authMiddleware, updateSubscriptionPlan);
router.delete("/subscription-plans/:id", authMiddleware, deleteSubscriptionPlan);

module.exports = router;
