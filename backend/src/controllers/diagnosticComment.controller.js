const prisma = require("../prisma/client");

const commentInclude = {
  author: { select: { id: true, email: true } },
  replies: {
    include: {
      author: { select: { id: true, email: true } },
    },
    orderBy: { created_at: "asc" },
  },
};

const maskDeleted = (comment) => {
  if (comment.is_deleted) {
    comment.body = "[deleted]";
    comment.images = [];
  }
  if (comment.replies && comment.replies.length > 0) {
    comment.replies = comment.replies.map(maskDeleted);
  }
  return comment;
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.diagnosticPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.is_deleted) {
      return res.status(404).json({ success: false, message: "Post not found or deleted" });
    }

    const comments = await prisma.diagnosticComment.findMany({
      where: { post_id: postId, parent_id: null },
      include: commentInclude,
      orderBy: { created_at: "asc" },
    });

    const maskedComments = comments.map(maskDeleted);

    res.json({ success: true, data: maskedComments });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { body, parent_id, images } = req.body;

    if (!body) return res.status(400).json({ success: false, message: "body is required" });

    const post = await prisma.diagnosticPost.findUnique({ where: { id: postId } });
    if (!post || post.is_deleted) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.status !== "open") {
      return res.status(400).json({ success: false, message: "Post must be open to add comments" });
    }

    if (parent_id) {
      const parentComment = await prisma.diagnosticComment.findUnique({
        where: { id: parent_id },
      });
      if (!parentComment || parentComment.post_id !== postId) {
        return res.status(404).json({ success: false, message: "Parent comment not found" });
      }
      if (parentComment.parent_id) {
        return res.status(400).json({ success: false, message: "Cannot reply to a reply (max depth is 1)" });
      }
    }

    const comment = await prisma.diagnosticComment.create({
      data: {
        post_id: postId,
        author_id: req.user.id,
        parent_id,
        body,
        images: images || [],
      },
      include: commentInclude,
    });

    res.status(201).json({ success: true, data: maskDeleted(comment) });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { postId, id } = req.params;
    const { body, images } = req.body;

    const comment = await prisma.diagnosticComment.findUnique({ where: { id }, include: commentInclude });

    if (!comment || comment.post_id !== postId) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.is_deleted) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.author_id !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

    const updated = await prisma.diagnosticComment.update({
      where: { id },
      data: {
        ...(body && { body }),
        ...(images && { images }),
      },
      include: commentInclude,
    });

    res.json({ success: true, data: maskDeleted(updated) });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Comment not found" });
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { postId, id } = req.params;

    const comment = await prisma.diagnosticComment.findUnique({ where: { id } });

    if (!comment || comment.post_id !== postId) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.diagnosticComment.update({
      where: { id },
      data: { is_deleted: true },
    });

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Comment not found" });
    next(error);
  }
};

const acceptAnswer = async (req, res, next) => {
  try {
    const { postId, id } = req.params;

    const post = await prisma.diagnosticPost.findUnique({ where: { id: postId } });
    if (!post || post.is_deleted) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author_id !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

    const comment = await prisma.diagnosticComment.findUnique({ where: { id }, include: commentInclude });
    if (!comment || comment.post_id !== postId) return res.status(404).json({ success: false, message: "Comment not found" });
    if (comment.is_deleted) return res.status(404).json({ success: false, message: "Comment not found" });

    const isAccepting = !comment.is_accepted_answer;

    let updatedComment;

    await prisma.$transaction(async (tx) => {
      if (isAccepting) {
        await tx.diagnosticComment.updateMany({
          where: { post_id: postId, is_accepted_answer: true },
          data: { is_accepted_answer: false },
        });

        updatedComment = await tx.diagnosticComment.update({
          where: { id },
          data: { is_accepted_answer: true },
          include: commentInclude,
        });

        await tx.diagnosticPost.update({
          where: { id: postId },
          data: { status: "resolved" },
        });
      } else {
        updatedComment = await tx.diagnosticComment.update({
          where: { id },
          data: { is_accepted_answer: false },
          include: commentInclude,
        });

        await tx.diagnosticPost.update({
          where: { id: postId },
          data: { status: "open" },
        });
      }
    });

    res.json({ success: true, data: maskDeleted(updatedComment) });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Comment not found" });
    next(error);
  }
};

const toggleCommentReaction = async (req, res, next) => {
  try {
    const { postId, id } = req.params;
    const user_id = req.user.id;

    const comment = await prisma.diagnosticComment.findUnique({ where: { id } });
    if (!comment || comment.post_id !== postId) return res.status(404).json({ success: false, message: "Comment not found" });

    const existing = await prisma.diagnosticReaction.findUnique({
      where: { user_id_target_id_target_type: { user_id, target_id: id, target_type: "comment" } },
    });

    if (existing) {
      await prisma.diagnosticReaction.delete({ where: { id: existing.id } });
      res.json({ success: true, data: { reacted: false } });
    } else {
      await prisma.diagnosticReaction.create({
        data: {
          user_id,
          target_id: id,
          target_type: "comment",
          comment_id: id,
        },
      });
      res.json({ success: true, data: { reacted: true } });
    }
  } catch (error) {
    if (error.code === "P2002") {
      res.json({ success: true, data: { reacted: true } });
      return;
    }
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  acceptAnswer,
  toggleCommentReaction,
};
