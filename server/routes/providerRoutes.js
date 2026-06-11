const express = require("express");
const router = express.Router();

const {
  getAllProviders,
  getProviderById,
  getNearbyProviders,
  getMyProviderProfile,
  updateProviderProfile,
  getProviderDashboard,
  toggleAvailability,
} = require("../controllers/providerController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────────────────────
// GET /api/providers?category=Plumbing&city=Coimbatore&sort=rating&page=1
router.get("/", getAllProviders);
router.get("/nearby", getNearbyProviders);

router.get(
  "/me",
  protect,
  authorize("provider", "admin"),
  getMyProviderProfile
);

router.put(
  "/me",
  protect,
  authorize("provider", "admin"),
  updateProviderProfile
);

router.get(
  "/me/dashboard",
  protect,
  authorize("provider", "admin"),
  getProviderDashboard
);

router.patch(
  "/me/availability",
  protect,
  authorize("provider", "admin"),
  toggleAvailability
);

// KEEP THIS LAST
router.get("/:id", getProviderById);

// PUT /api/providers/me  ← update own profile
router.put(
  "/me",
  protect,
  authorize("provider", "admin"),
  updateProviderProfile
);

// GET /api/providers/me/dashboard  ← stats & earnings
router.get(
  "/me/dashboard",
  protect,
  authorize("provider", "admin"),
  getProviderDashboard
);

// PATCH /api/providers/me/availability  ← quick toggle
router.patch(
  "/me/availability",
  protect,
  authorize("provider", "admin"),
  toggleAvailability
);

module.exports = router;