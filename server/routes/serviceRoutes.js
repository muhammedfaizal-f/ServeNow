const express = require("express");
const router = express.Router();

const {
  getAllServices,
  getCategories,
  getServicesByCategory,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getPopularServices,
} = require("../controllers/serviceController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/services
// GET /api/services?category=Plumbing&minPrice=100&maxPrice=500&search=pipe&sort=priceLow
router.get("/", getAllServices);

// GET /api/services/categories   ← all category names + counts
router.get("/categories", getCategories);

// GET /api/services/popular      ← top 8 most booked
router.get("/popular", getPopularServices);

// GET /api/services/category/:category
// GET /api/services/category/Plumbing?sort=priceLow&page=1
router.get("/category/:category", getServicesByCategory);

// GET /api/services/:id          ← single service + related services
router.get("/:id", getServiceById);

// ── Private routes (provider only) ───────────────────────────────────────────

// GET /api/services/provider/my  ← provider's own services list
router.get(
  "/provider/my",
  protect,
  authorize("provider", "admin"),
  getMyServices
);

// POST /api/services             ← create a new service
router.post(
  "/",
  protect,
  authorize("provider", "admin"),
  createService
);

// PUT /api/services/:id          ← update own service
router.put(
  "/:id",
  protect,
  authorize("provider", "admin"),
  updateService
);

// DELETE /api/services/:id       ← soft-delete own service
router.delete(
  "/:id",
  protect,
  authorize("provider", "admin"),
  deleteService
);

module.exports = router;