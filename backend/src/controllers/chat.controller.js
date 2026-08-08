const prisma = require("../prisma/client");
const uploadImage = require("../utils/uploadImage");
const { getIO } = require("../socket");

// Helper to get conversation with a specific user or create one
const getOrCreateConversation = async (userId1, userId2) => {
  // Try to find existing
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant_one_id: userId1, participant_two_id: userId2 },
        { participant_one_id: userId2, participant_two_id: userId1 }
      ]
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant_one_id: userId1,
        participant_two_id: userId2
      }
    });
  }

  return conversation;
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant_one_id: userId },
          { participant_two_id: userId }
        ]
      },
      include: {
        participant_one: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        participant_two: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      },
      orderBy: { updated_at: "desc" }
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

exports.getOrCreate = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;
    
    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });

    const conversation = await getOrCreateConversation(senderId, recipientId);
    
    // Also include the other participant details so the frontend can display them properly
    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participant_one: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        participant_two: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        messages: { orderBy: { created_at: "desc" }, take: 1 }
      }
    });

    res.json(fullConversation);
  } catch (error) {
    console.error("Error creating/getting conversation:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: id },
      orderBy: { created_at: "asc" }
    });

    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
    
    if (!recipientId) {
       return res.status(400).json({ error: "recipientId is required" });
    }

    let messageType = "text";
    let messageContent = content;

    // Handle file upload if present
    if (req.file) {
      const result = await uploadImage(req.file.buffer, "chat_attachments");
      messageContent = result.secure_url;
      // Determine if image or file
      if (result.resource_type === 'image') {
        messageType = "image";
      } else {
        messageType = "file";
      }
    } else if (!content) {
      return res.status(400).json({ error: "Message content or file is required" });
    }

    const conversation = await getOrCreateConversation(senderId, recipientId);

    const message = await prisma.message.create({
      data: {
        conversation_id: conversation.id,
        sender_id: senderId,
        content: messageContent,
        message_type: messageType
      }
    });

    // Update conversation updated_at
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updated_at: new Date() }
    });

    // Emit real-time message via socket
    try {
      const io = getIO();
      io.to(`user_${recipientId}`).emit("new_message", message);
      // We don't emit back to the sender since they receive it in REST response,
      // but emitting to both is also common if they have multiple tabs open.
      io.to(`user_${senderId}`).emit("new_message", message);
    } catch (e) {
      // Socket io might not be initialized or error out, ignore it for REST response
      console.warn("Socket.io not initialized or error:", e.message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user.id;

    await prisma.message.updateMany({
      where: {
        conversation_id: id,
        sender_id: { not: userId },
        is_read: false
      },
      data: { is_read: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
