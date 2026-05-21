const express = require("express");
const router  = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllProviders,
  verifyProvider,
  toggleProviderStatus,
  getAllBookings,
  getFlaggedReviews,
  hideReview,
  dismissFlag,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes require login + admin role
router.use(protect);
router.use(authorize("admin"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
router.get("/dashboard", getDashboardStats);

// ── Users ─────────────────────────────────────────────────────────────────────
// GET /api/admin/users?search=arun&role=user&page=1
router.get("/users", getAllUsers);

// PATCH /api/admin/users/:id/toggle-status
router.patch("/users/:id/toggle-status", toggleUserStatus);

// ── Providers ─────────────────────────────────────────────────────────────────
// GET /api/admin/providers?isVerified=false
router.get("/providers", getAllProviders);

// PATCH /api/admin/providers/:id/verify
router.patch("/providers/:id/verify", verifyProvider);

// PATCH /api/admin/providers/:id/toggle-status
router.patch("/providers/:id/toggle-status", toggleProviderStatus);

// ── Bookings ──────────────────────────────────────────────────────────────────
// GET /api/admin/bookings?status=pending&page=1
router.get("/bookings", getAllBookings);

// ── Reviews ───────────────────────────────────────────────────────────────────
// GET  /api/admin/reviews/flagged
router.get("/reviews/flagged", getFlaggedReviews);

// PATCH /api/admin/reviews/:id/hide
router.patch("/reviews/:id/hide", hideReview);

// PATCH /api/admin/reviews/:id/dismiss-flag
router.patch("/reviews/:id/dismiss-flag", dismissFlag);

module.exports = router;