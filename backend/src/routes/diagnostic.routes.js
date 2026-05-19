const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const {
  getPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  toggleSave,
  toggleReaction,
} = require("../controllers/diagnostic.controller");

const router = express.Router();

// Public routes
router.get("/", getPosts);

// Protected routes
router.use(authMiddleware);

// IMPORTANT: /user/me must come BEFORE /:id so "user" isn't treated as an id
router.get("/user/me", getMyPosts);
router.get("/:id", getPostById);

router.post("/", upload.array("images", 10), createPost);
router.patch("/:id", upload.array("images", 10), updatePost);
router.patch("/:id/status", updatePostStatus);
router.delete("/:id", deletePost);
router.post("/:id/save", toggleSave);
router.post("/:id/react", toggleReaction);

module.exports = router;
