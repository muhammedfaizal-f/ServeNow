const { body, validationResult } = require("express-validator");

// ── Helper: run validation and return errors ──────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // return first error only
      errors: errors.array(),
    });
  }
  next();
};

// ── Register validation rules ─────────────────────────────────────────────────
const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
    .matches(/\d/).withMessage("Password must contain at least one number."),

  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian phone number."),

  body("role")
    .optional()
    .isIn(["user", "provider"]).withMessage("Role must be 'user' or 'provider'."),

  validate,
];

// ── Login validation rules ────────────────────────────────────────────────────
const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),

  validate,
];

// ── Change password validation rules ─────────────────────────────────────────
const validateChangePassword = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required."),

  body("newPassword")
    .notEmpty().withMessage("New password is required.")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters.")
    .matches(/\d/).withMessage("New password must contain at least one number."),

  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};