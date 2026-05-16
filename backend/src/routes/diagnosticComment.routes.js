const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  acceptAnswer,
  toggleCommentReaction,
} = require("../controllers/diagnosticComment.controller");

const router = express.Router({ mergeParams: true });

router.get("/", getComments);

router.use(authMiddleware);

router.post("/", createComment);
router.patch("/:id", updateComment);
router.delete("/:id", deleteComment);
router.patch("/:id/accept", acceptAnswer);
router.post("/:id/react", toggleCommentReaction);

module.exports = router;
