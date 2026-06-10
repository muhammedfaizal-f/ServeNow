const express = require("express");
const router  = express.Router();

const {
  createReview,
  getProviderReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleHelpful,
  flagReview,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────────────────────

router.get("/provider/:providerId", getProviderReviews);

router.get("/my", protect, getMyReviews);

router.get("/:id", getReviewById);

router.post("/", protect, authorize("user", "admin"), createReview);

// PUT /api/reviews/:id  ← user edits their review
router.put("/:id", protect, updateReview);

// DELETE /api/reviews/:id  ← user or admin deletes
router.delete("/:id", protect, deleteReview);

// PATCH /api/reviews/:id/helpful  ← toggle helpful vote
router.patch("/:id/helpful", protect, toggleHelpful);

// PATCH /api/reviews/:id/flag  ← flag as inappropriate
router.patch("/:id/flag", protect, flagReview);

module.exports = router;