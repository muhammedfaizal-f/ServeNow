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

// GET /api/reviews/provider/:providerId
// GET /api/reviews/provider/:providerId?sort=newest&page=1&rating=5
router.get("/provider/:providerId", getProviderReviews);

// GET /api/reviews/:id
router.get("/:id", getReviewById);

// ── Private routes ────────────────────────────────────────────────────────────

// POST /api/reviews  ← user submits review after completed booking
router.post(
  "/",
  protect,
  authorize("user", "admin"),
  createReview
);

// GET /api/reviews/my  ← user sees all their own reviews
router.get("/my", protect, getMyReviews);

// PUT /api/reviews/:id  ← user edits their review
router.put("/:id", protect, updateReview);

// DELETE /api/reviews/:id  ← user or admin deletes
router.delete("/:id", protect, deleteReview);

// PATCH /api/reviews/:id/helpful  ← toggle helpful vote
router.patch("/:id/helpful", protect, toggleHelpful);

// PATCH /api/reviews/:id/flag  ← flag as inappropriate
router.patch("/:id/flag", protect, flagReview);

module.exports = router;