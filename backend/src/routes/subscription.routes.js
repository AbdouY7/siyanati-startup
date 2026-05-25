const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createSubscription,
  getMySubscriptions,
  getMyActiveSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  cancelSubscription,
  suspendSubscription,
  reactivateSubscription,
  getPlatformSettings,
  updatePlatformSetting,
} = require("../controllers/subscription.controller");

const router = express.Router();

// Platform Settings (Admin)
router.get("/platform-settings", authMiddleware, getPlatformSettings);
router.patch("/platform-settings/:key", authMiddleware, updatePlatformSetting);

// My Subscriptions
router.get("/subscriptions/my", authMiddleware, getMySubscriptions);
router.get("/subscriptions/my/active", authMiddleware, getMyActiveSubscription);
router.patch("/subscriptions/my/cancel", authMiddleware, cancelSubscription);

// General Subscriptions
router.post("/subscriptions", authMiddleware, createSubscription);
router.get("/subscriptions", authMiddleware, getAllSubscriptions);
router.get("/subscriptions/:id", authMiddleware, getSubscriptionById);
router.patch("/subscriptions/:id/suspend", authMiddleware, suspendSubscription);
router.patch("/subscriptions/:id/reactivate", authMiddleware, reactivateSubscription);

module.exports = router;
