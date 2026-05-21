const { User, Provider, Booking, Service, Review } = require("../models");
const mongoose = require("mongoose");

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/dashboard
// @desc    Get overall platform statistics
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      totalServices,
      totalReviews,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      unverifiedProviders,
      flaggedReviews,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Provider.countDocuments(),
      Booking.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Review.countDocuments({ isVisible: true }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Provider.countDocuments({ isVerified: false, isActive: true }),
      Review.countDocuments({ isFlagged: true }),
    ]);

    // Total platform revenue from completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly bookings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count:   { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top 5 categories by booking count
    const topCategories = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from:         "services",
          localField:   "service",
          foreignField: "_id",
          as:           "serviceData",
        },
      },
      { $unwind: "$serviceData" },
      {
        $group: {
          _id:   "$serviceData.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate("user",    "name email")
      .populate("service", "title category")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalServices,
        totalReviews,
        totalRevenue,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        unverifiedProviders,
        flaggedReviews,
      },
      monthlyBookings,
      topCategories,
      recentBookings,
    });
  } catch (error) {
    console.error("getDashboardStats:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/users
// @desc    Get all users with search and pagination
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role)     filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    console.error("getAllUsers:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Activate or deactivate a user account
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success:  true,
      message:  `User account ${user.isActive ? "activated" : "deactivated"}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("toggleUserStatus:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/providers
// @desc    Get all providers — with pending verification filter
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const getAllProviders = async (req, res) => {
  try {
    const { isVerified, isActive, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";
    if (isActive   !== undefined) filter.isActive   = isActive   === "true";
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await Promise.all([
      Provider.find(filter)
        .populate("user", "name email phone avatar createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Provider.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      providers,
    });
  } catch (error) {
    console.error("getAllProviders:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/providers/:id/verify
// @desc    Approve (verify) a provider
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const verifyProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate(
      "user", "name email"
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    provider.isVerified = true;
    provider.badge      = provider.badge || "Pro Verified";
    await provider.save();

    res.status(200).json({
      success:  true,
      message:  `Provider ${provider.user.name} has been verified.`,
      provider,
    });
  } catch (error) {
    console.error("verifyProvider:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/providers/:id/toggle-status
// @desc    Suspend or reactivate a provider
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const toggleProviderStatus = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    provider.isActive = !provider.isActive;
    await provider.save();

    res.status(200).json({
      success:  true,
      message:  `Provider ${provider.isActive ? "reactivated" : "suspended"}.`,
      isActive: provider.isActive,
    });
  } catch (error) {
    console.error("toggleProviderStatus:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/bookings
// @desc    Get all bookings across platform
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user",    "name email phone")
        .populate("service", "title category")
        .populate({
          path: "provider",
          populate: { path: "user", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    console.error("getAllBookings:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/reviews/flagged
// @desc    Get all flagged reviews for moderation
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const getFlaggedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isFlagged: true })
      .populate("user",     "name email")
      .populate("provider", "category")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: reviews.length, reviews });
  } catch (error) {
    console.error("getFlaggedReviews:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/reviews/:id/hide
// @desc    Hide a flagged review (remove from public view)
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const hideReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    review.isVisible = false;
    review.isFlagged = false;
    await review.save(); // triggers provider avg rating recalculation

    res.status(200).json({ success: true, message: "Review hidden from public view." });
  } catch (error) {
    console.error("hideReview:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/reviews/:id/dismiss-flag
// @desc    Dismiss a flag — review stays visible
// @access  Private (admin)
// ────────────────────────────────────────────────────────────────────────────
const dismissFlag = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFlagged: false, flagReason: "" },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    res.status(200).json({ success: true, message: "Flag dismissed. Review remains visible." });
  } catch (error) {
    console.error("dismissFlag:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
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
};