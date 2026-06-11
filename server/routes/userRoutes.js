const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getMyBookings,
  toggleSaveProvider,
  getSavedProviders,
  deactivateAccount,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// All user routes are protected
router.use(protect);

// ── Profile ───────────────────────────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// ── Bookings ──────────────────────────────────────────────────────────────────
// GET /api/users/bookings?status=pending&page=1&limit=10
router.get("/bookings", getMyBookings);

// ── Saved providers ───────────────────────────────────────────────────────────
router.get("/saved", getSavedProviders);
router.post("/saved/:providerId", toggleSaveProvider);

// ── Account ───────────────────────────────────────────────────────────────────
router.delete("/account", deactivateAccount);

module.exports = router;