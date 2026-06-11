const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Provider, Service } = require("../models");

// ── Helper: generate JWT ──────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Helper: send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user or provider
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Only allow "user" or "provider" roles on registration
    const allowedRoles = ["user", "provider"];
    const assignedRole = allowedRoles.includes(role) ? role : "user";

    // Create user (password hashing happens in User model pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
    });

    // If registering as a provider, create a blank Provider profile
    if (assignedRole === "provider") {

      await Provider.create({
        user: user._id,
        category: req.body.category || "Home Cleaning",
        hourlyRate: req.body.hourlyRate || 0,
      });

    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use.",
      });
    }
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated. Contact support.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged-in user
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // If provider, attach provider profile too
    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = await Provider.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      providerProfile,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @desc    Change password (logged-in user)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("ChangePassword error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token and (in production) send email
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      // Generic message to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate raw token & store hashed version
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In production: send email with resetToken
    // For development: return token in response
    res.status(200).json({
      success: true,
      message: "Password reset token generated.",
      // Remove below line in production — only send via email
      resetToken,
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password using token from email
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    // Hash the incoming token and look it up
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    user.password = newPassword; // hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (client deletes token; server-side hint only)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please delete the token on client.",
    token: null,
  });
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};