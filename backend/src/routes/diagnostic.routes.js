const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  toggleSave,
  toggleReaction,
} = require("../controllers/diagnostic.controller");

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);

router.use(authMiddleware);

router.post("/", createPost);
router.patch("/:id", updatePost);
router.patch("/:id/status", updatePostStatus);
router.delete("/:id", deletePost);
router.post("/:id/save", toggleSave);
router.post("/:id/react", toggleReaction);

module.exports = router;
