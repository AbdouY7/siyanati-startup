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

router.use(authMiddleware);

// Platform Settings (Admin)
router.get("/platform-settings", getPlatformSettings);
router.patch("/platform-settings/:key", updatePlatformSetting);

// My Subscriptions
router.get("/subscriptions/my", getMySubscriptions);
router.get("/subscriptions/my/active", getMyActiveSubscription);
router.patch("/subscriptions/my/cancel", cancelSubscription);

// General Subscriptions
router.post("/subscriptions", createSubscription);
router.get("/subscriptions", getAllSubscriptions);
router.get("/subscriptions/:id", getSubscriptionById);
router.patch("/subscriptions/:id/suspend", suspendSubscription);
router.patch("/subscriptions/:id/reactivate", reactivateSubscription);

module.exports = router;
