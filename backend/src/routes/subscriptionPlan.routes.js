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

router.use(authMiddleware);

router.post("/subscription-plans", createSubscriptionPlan);
router.patch("/subscription-plans/:id", updateSubscriptionPlan);
router.delete("/subscription-plans/:id", deleteSubscriptionPlan);

module.exports = router;
