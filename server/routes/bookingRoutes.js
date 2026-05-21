const express = require("express");
const router  = express.Router();

const {
  createBooking,
  getBookingById,
  getProviderBookings,
  confirmBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  rescheduleBooking,
  getBookingSummary,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All booking routes require login
router.use(protect);

// ── Summary (must be before /:id to avoid param conflict) ────────────────────
// GET /api/bookings/summary
router.get("/summary", getBookingSummary);

// ── Provider's job list ───────────────────────────────────────────────────────
// GET /api/bookings/provider/list?status=pending&page=1&date=2025-06-01
router.get(
  "/provider/list",
  authorize("provider", "admin"),
  getProviderBookings
);

// ── Core booking CRUD ─────────────────────────────────────────────────────────
// POST   /api/bookings
router.post("/", authorize("user", "admin"), createBooking);

// GET    /api/bookings/:id
router.get("/:id", getBookingById);

// ── Status transition routes ──────────────────────────────────────────────────
//
//  pending ──► confirmed   (provider)
//          └─► rejected    (provider)
//  confirmed ──► in-progress (provider)
//  in-progress ──► completed (provider)
//  pending|confirmed ──► cancelled (user ≥2h before, provider, admin)
//  pending|confirmed ──► rescheduled → back to pending (user)

// Provider actions
router.patch("/:id/confirm",     authorize("provider", "admin"), confirmBooking);
router.patch("/:id/reject",      authorize("provider", "admin"), rejectBooking);
router.patch("/:id/start",       authorize("provider", "admin"), startBooking);
router.patch("/:id/complete",    authorize("provider", "admin"), completeBooking);

// Shared: user, provider, or admin can cancel
router.patch("/:id/cancel",      cancelBooking);

// User reschedules
router.patch("/:id/reschedule",  authorize("user", "admin"), rescheduleBooking);

module.exports = router;
