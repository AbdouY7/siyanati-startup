const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
  verifyReview,
  markHelpful,
} = require("../controllers/review.controller");

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReviewById);

router.use(authMiddleware);

router.post("/", createReview);
router.delete("/:id", deleteReview);
router.patch("/:id/verify", verifyReview);
router.post("/:id/helpful", markHelpful);

module.exports = router;
