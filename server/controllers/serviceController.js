const { Service, Provider } = require("../models");

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services
// @desc    Get all services with search, filter, sort, pagination
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getAllServices = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      pricingType,
      minPrice,
      maxPrice,
      search,
      sort = "popular",
      page = 1,
      limit = 12,
    } = req.query;

    // ── Build filter ──────────────────────────────────────────────────────────
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (pricingType) filter.pricingType = pricingType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ── Full-text search (uses text index from Service model) ─────────────────
    if (search) {
      filter.$text = { $search: search };
    }

    // ── Sort options ──────────────────────────────────────────────────────────
    const sortOptions = {
      popular: { bookingCount: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortBy = search
      ? { score: { $meta: "textScore" } }   // rank by text relevance if searching
      : (sortOptions[sort] || sortOptions.popular);

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      Service.find(
        filter,
        search ? { score: { $meta: "textScore" } } : {}
      )
        .populate({
          path: "provider",
          select: "category hourlyRate averageRating isAvailable location",
          populate: { path: "user", select: "name avatar" },
        })
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Service.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      services,
    });
  } catch (error) {
    console.error("getAllServices:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services/categories
// @desc    Get list of all categories with service counts
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          serviceCount: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalBookings: { $sum: "$bookingCount" },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    // Attach icon and description metadata
    const categoryMeta = {
      "Plumbing": { icon: "🔧", desc: "Pipe repairs, leaks & installations" },
      "Electrician": { icon: "⚡", desc: "Wiring, fuse box & fan fitting" },
      "Home Cleaning": { icon: "🧹", desc: "Deep clean & regular maintenance" },
      "Painting": { icon: "🎨", desc: "Interior & exterior wall painting" },
      "AC Repair": { icon: "❄️", desc: "Service, gas refill & cleaning" },
      "Carpentry": { icon: "🛠", desc: "Furniture fix & custom shelves" },
      "Tutoring": { icon: "📚", desc: "Home tutor for all subjects" },
      "Pet Care": { icon: "🐾", desc: "Dog walking & grooming" },
      "Gardening": { icon: "🪴", desc: "Lawn care & plant trimming" },
      "Moving Help": { icon: "📦", desc: "Packing, loading & delivery" },
      "Locksmith": { icon: "🔑", desc: "Lock repair & key cutting" },
      "Home Cook": { icon: "🍳", desc: "Daily cooking & event catering" },
    };

    const enriched = categories.map((cat) => ({
      category: cat._id,
      serviceCount: cat.serviceCount,
      avgPrice: Math.round(cat.avgPrice),
      totalBookings: cat.totalBookings,
      ...(categoryMeta[cat._id] || {}),
    }));

    res.status(200).json({
      success: true,
      total: enriched.length,
      categories: enriched,
    });
  } catch (error) {
    console.error("getCategories:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services/category/:category
// @desc    Get all services in a specific category
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sort = "popular" } = req.query;

    const sortOptions = {
      popular: { bookingCount: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      Service.find({ category, isActive: true })
        .populate({
          path: "provider",
          select: "hourlyRate averageRating isAvailable location",
          populate: { path: "user", select: "name avatar phone" },
        })
        .sort(sortOptions[sort] || sortOptions.popular)
        .skip(skip)
        .limit(Number(limit)),
      Service.countDocuments({ category, isActive: true }),
    ]);

    if (total === 0) {
      return res.status(404).json({
        success: false,
        message: `No services found for category: ${category}`,
      });
    }

    res.status(200).json({
      success: true,
      category,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      services,
    });
  } catch (error) {
    console.error("getServicesByCategory:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services/:id
// @desc    Get a single service by ID
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: "provider",
      select: "category hourlyRate averageRating totalReviews isAvailable location skills experience badge responseTime",
      populate: { path: "user", select: "name avatar phone" },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Get related services from same category (excluding this one)
    const related = await Service.find({
      _id: { $ne: service._id },
      category: service.category,
      isActive: true,
    })
      .populate({ path: "provider", populate: { path: "user", select: "name avatar" } })
      .limit(4);

    res.status(200).json({ success: true, service, related });
  } catch (error) {
    console.error("getServiceById:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/services
// @desc    Provider creates a new service
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subCategory,
      pricingType,
      price,
      estimatedDuration,
      images,
      tags,
    } = req.body;

    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "title, description, category and price are required.",
      });
    }

    // Get provider profile
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found. Please complete your profile first.",
      });
    }

    // Category must match provider's category
    if (category !== provider.category) {
      return res.status(400).json({
        success: false,
        message: `Your provider category is '${provider.category}'. You can only create services in that category.`,
      });
    }

    const service = await Service.create({
      provider: provider._id,
      title,
      description,
      category,
      subCategory: subCategory || "",
      pricingType: pricingType || "hourly",
      price,
      estimatedDuration: estimatedDuration || 60,
      images: images || [],
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("createService:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/services/:id
// @desc    Provider updates their own service
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("provider");

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Verify ownership
    const provider = await Provider.findOne({ user: req.user._id });
    if (
      !provider ||
      service.provider._id.toString() !== provider._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const {
      title, description, subCategory,
      pricingType, price, estimatedDuration,
      images, tags, isActive,
    } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (subCategory !== undefined) updateFields.subCategory = subCategory;
    if (pricingType !== undefined) updateFields.pricingType = pricingType;
    if (price !== undefined) updateFields.price = price;
    if (estimatedDuration !== undefined) updateFields.estimatedDuration = estimatedDuration;
    if (images !== undefined) updateFields.images = images;
    if (tags !== undefined) updateFields.tags = tags;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Service updated.",
      service: updated,
    });
  } catch (error) {
    console.error("updateService:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/services/:id
// @desc    Provider soft-deletes (deactivates) their service
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider || service.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Soft delete — set isActive: false
    service.isActive = false;
    await service.save();

    res.status(200).json({ success: true, message: "Service deactivated successfully." });
  } catch (error) {
    console.error("deleteService:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services/provider/my
// @desc    Get all services created by the logged-in provider
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const getMyServices = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found." });
    }

    const services = await Service.find({ provider: provider._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: services.length,
      services,
    });
  } catch (error) {
    console.error("getMyServices:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/services/popular
// @desc    Get top 8 most booked services across all categories
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getPopularServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate({
        path: "provider",
        select: "averageRating isAvailable",
        populate: { path: "user", select: "name avatar" },
      })
      .sort({ bookingCount: -1 })
      .limit(8);

    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("getPopularServices:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllServices,
  getCategories,
  getServicesByCategory,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getPopularServices,
};