const express = require("express");
const router  = express.Router();

const {
  createBooking,
  getBookingById,
  getProviderBookings,   // ← NOT getProviderList
  confirmBooking,        // ← NOT confirm
  rejectBooking,         // ← NOT reject
  startBooking,          // ← NOT start
  completeBooking,       // ← NOT complete
  cancelBooking,         // ← NOT cancel
  rescheduleBooking,
  getBookingSummary,     // ← NOT getSummary
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// GET /api/bookings/summary
router.get("/summary", getBookingSummary);

// GET /api/bookings/provider/list
router.get("/provider/list", authorize("provider","admin"), getProviderBookings);

// POST /api/bookings
router.post("/", authorize("user","admin"), createBooking);

// GET /api/bookings/:id
router.get("/:id", getBookingById);

// Provider actions
router.patch("/:id/confirm",    authorize("provider","admin"), confirmBooking);
router.patch("/:id/reject",     authorize("provider","admin"), rejectBooking);
router.patch("/:id/start",      authorize("provider","admin"), startBooking);
router.patch("/:id/complete",   authorize("provider","admin"), completeBooking);

// Anyone can cancel
router.patch("/:id/cancel",     cancelBooking);

// User reschedules
router.patch("/:id/reschedule", authorize("user","admin"), rescheduleBooking);

module.exports = router;