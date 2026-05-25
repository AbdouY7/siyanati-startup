const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getMyNotifications, markAsRead } = require("../controllers/notification.controller");

const router = express.Router();

router.get("/notifications", authMiddleware, getMyNotifications);
router.patch("/notifications/:id/read", authMiddleware, markAsRead);

module.exports = router;
