const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// ── Protected routes (JWT required) ──────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

module.exports = router;