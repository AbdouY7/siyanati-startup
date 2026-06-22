const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getMyNotifications, markAsRead, getBadgeCounts, markAsReadByType } = require("../controllers/notification.controller");

const router = express.Router();

router.get("/notifications", authMiddleware, getMyNotifications);
router.get("/notifications/badges/counts", authMiddleware, getBadgeCounts);
router.patch("/notifications/read-by-type", authMiddleware, markAsReadByType);
router.patch("/notifications/:id/read", authMiddleware, markAsRead);

module.exports = router;
