const { User, Provider, Booking } = require("../models");

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/users/profile
// @desc    Get logged-in user's own profile
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/users/profile
// @desc    Update logged-in user's profile
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phone) updateFields.phone = phone.trim();
    if (avatar) updateFields.avatar = avatar;
    if (address) updateFields.address = address;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/users/bookings
// @desc    Get logged-in user's booking history with pagination
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate({
          path: "provider",
          populate: { path: "user", select: "name avatar phone" },
        })
        .populate("service", "title category price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/users/saved/:providerId
// @desc    Save / unsave a provider (toggle)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const toggleSaveProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { providerId } = req.params;

    const isSaved = user.savedProviders.map(String).includes(providerId);

    if (isSaved) {
      user.savedProviders = user.savedProviders.filter(
        (id) => id.toString() !== providerId
      );
    } else {
      user.savedProviders.push(providerId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? "Provider removed from saved." : "Provider saved.",
      isSaved: !isSaved,
      savedCount: user.savedProviders.length,
    });
  } catch (error) {
    console.error("toggleSaveProvider error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/users/saved
// @desc    Get all saved providers for logged-in user
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getSavedProviders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedProviders",
      populate: { path: "user", select: "name avatar phone" },
    });

    res.status(200).json({
      success: true,
      total: user.savedProviders.length,
      providers: user.savedProviders,
    });
  } catch (error) {
    console.error("getSavedProviders error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/users/account
// @desc    Soft-delete (deactivate) user account
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Account deactivated. Contact support to reactivate.",
    });
  } catch (error) {
    console.error("deactivateAccount error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyBookings,
  toggleSaveProvider,
  getSavedProviders,
  deactivateAccount,
};