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
  getSavedPosts,
} = require("../controllers/diagnostic.controller");

const router = express.Router();

// Public routes
router.get("/", getPosts);

// These authenticated GET routes must be declared before the public /:id catch-all
router.get("/user/me", authMiddleware, getMyPosts);
router.get("/saved", authMiddleware, getSavedPosts);

// Public: view a single post by ID (controller handles auth optionally)
router.get("/:id", getPostById);

// Protected routes (all remaining)
router.use(authMiddleware);

router.post("/", upload.array("images", 10), createPost);
router.patch("/:id", upload.array("images", 10), updatePost);
router.patch("/:id/status", updatePostStatus);
router.delete("/:id", deletePost);
router.post("/:id/save", toggleSave);
router.post("/:id/react", toggleReaction);

module.exports = router;
