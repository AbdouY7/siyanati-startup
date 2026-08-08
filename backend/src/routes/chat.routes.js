const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Get all conversations for the user
router.get("/conversations", chatController.getConversations);

// Create or get a conversation by recipientId
router.post("/conversations", chatController.getOrCreate);

// Get messages for a specific conversation
router.get("/conversations/:id/messages", chatController.getMessages);

// Send a message (text or file/image)
router.post("/messages", upload.single("attachment"), chatController.sendMessage);

// Mark all messages in a conversation as read
router.patch("/conversations/:id/read", chatController.markAsRead);

module.exports = router;
