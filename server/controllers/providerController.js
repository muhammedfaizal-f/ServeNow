const { Provider, User, Booking, Review, Service } = require("../models");
// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/providers
// @desc    Get all providers with filters, search, sort, pagination
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getAllProviders = async (req, res) => {
  try {
    const {
      category,
      city,
      minRate,
      maxRate,
      minRating,
      isAvailable,
      search,
      sort = "averageRating",
      page = 1,
      limit = 12,
    } = req.query;

    // ── Build filter ──────────────────────────────────────────────────────────
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (isAvailable) filter.isAvailable = isAvailable === "true";
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    // ── Search by skill or bio keyword ───────────────────────────────────────
    if (search) {
      filter.$or = [
        { skills: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // ── Sort options ─────────────────────────────────────────────────────────
    const sortOptions = {
      rating: { averageRating: -1 },
      priceLow: { hourlyRate: 1 },
      priceHigh: { hourlyRate: -1 },
      jobs: { totalJobsDone: -1 },
      newest: { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.rating;

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await Promise.all([
      Provider.find(filter)
        .populate("user", "name avatar phone")
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Provider.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      providers,
    });
  } catch (error) {
    console.error("getAllProviders error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/providers/:id
// @desc    Get a single provider by ID (full profile)
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate(
      "user",
      "name avatar phone email"
    );

    if (!provider || !provider.isActive) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    // Fetch latest 5 reviews alongside
    const reviews = await Review.find({ provider: provider._id, isVisible: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, provider, reviews });
  } catch (error) {
    console.error("getProviderById error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/providers/nearby
// @desc    Get providers near a location (requires ?lat=&lng=&radius=)
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getNearbyProviders = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const filter = {
      isActive: true,
      isAvailable: true,
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius) * 1000, // convert km → metres
        },
      },
    };

    if (category) filter.category = category;

    const providers = await Provider.find(filter)
      .populate("user", "name avatar phone")
      .limit(20);

    res.status(200).json({
      success: true,
      total: providers.length,
      providers,
    });
  } catch (error) {
    console.error("getNearbyProviders error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/providers/me
// @desc    Get the provider profile of the logged-in provider
// @access  Private (provider only)
// ────────────────────────────────────────────────────────────────────────────
const getMyProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id }).populate(
      "user",
      "name avatar phone email"
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found. Please complete your profile.",
      });
    }

    res.status(200).json({ success: true, provider });
  } catch (error) {
    console.error("getMyProviderProfile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/providers/me
// @desc    Update logged-in provider's profile
// @access  Private (provider only)
// ────────────────────────────────────────────────────────────────────────────
const updateProviderProfile = async (req, res) => {
  try {
    const {
      bio,
      category,
      skills,
      experience,
      hourlyRate,
      location,
      isAvailable,
      availableDays,
      workingHours,
      responseTime,
      profilePhoto,
    } = req.body;

    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (category) updateFields.category = category;
    if (skills) updateFields.skills = skills;
    if (experience !== undefined) updateFields.experience = experience;
    if (hourlyRate !== undefined) updateFields.hourlyRate = hourlyRate;
    if (location) updateFields.location = location;
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;
    if (availableDays) updateFields.availableDays = availableDays;
    if (workingHours) updateFields.workingHours = workingHours;
    if (responseTime) updateFields.responseTime = responseTime;
    if (profilePhoto) updateFields.profilePhoto = profilePhoto;

    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("user", "name avatar phone");

    if (skills && Array.isArray(skills)) {

      await Service.deleteMany({
        provider: provider._id
      });

      const services = skills.map(skill => ({
        provider: provider._id,
        title: skill,
        description: `${skill} service`,
        category: provider.category,
        subCategory: skill,
        pricingType: "fixed",
        price: provider.hourlyRate || 0,
        estimatedDuration: 60,
        isActive: true,
      }));

      await Service.insertMany(services);
    }

    res.status(200).json({
      success: true,
      message: "Provider profile updated.",
      provider,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("updateProviderProfile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/providers/me/dashboard
// @desc    Provider dashboard — stats: bookings, earnings, rating summary
// @access  Private (provider only)
// ────────────────────────────────────────────────────────────────────────────
const getProviderDashboard = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found." });
    }

    // Booking stats
    const [totalBookings, pendingBookings, completedBookings, cancelledBookings] =
      await Promise.all([
        Booking.countDocuments({ provider: provider._id }),
        Booking.countDocuments({ provider: provider._id, status: "pending" }),
        Booking.countDocuments({ provider: provider._id, status: "completed" }),
        Booking.countDocuments({ provider: provider._id, status: "cancelled" }),
      ]);

    // Total earnings from completed bookings
    const earningsResult = await Booking.aggregate([
      { $match: { provider: provider._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find({ provider: provider._id })
      .populate("user", "name avatar")
      .populate("service", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings,
        averageRating: provider.averageRating,
        totalReviews: provider.totalReviews,
        totalJobsDone: provider.totalJobsDone,
      },
      recentBookings,
    });
  } catch (error) {
    console.error("getProviderDashboard error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/providers/me/availability
// @desc    Toggle provider availability on/off quickly
// @access  Private (provider only)
// ────────────────────────────────────────────────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found." });
    }

    provider.isAvailable = !provider.isAvailable;
    await provider.save();

    res.status(200).json({
      success: true,
      message: `You are now ${provider.isAvailable ? "available" : "unavailable"}.`,
      isAvailable: provider.isAvailable,
    });
  } catch (error) {
    console.error("toggleAvailability error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  getNearbyProviders,
  getMyProviderProfile,
  updateProviderProfile,
  getProviderDashboard,
  toggleAvailability,
};