const mongoose = require("mongoose");
const { Booking, Provider, Service } = require("../models");

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (user)
// ────────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      bookingDate,
      timeSlot,
      jobAddress,
      paymentMethod,
      userNotes,
    } = req.body;

    if (!providerId || !serviceId || !bookingDate || !timeSlot || !jobAddress) {
      return res.status(400).json({
        success: false,
        message: "providerId, serviceId, bookingDate, timeSlot and jobAddress are required.",
      });
    }

    // Check provider exists and is available
    const provider = await Provider.findById(providerId);
    if (!provider || !provider.isActive) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }
    if (!provider.isAvailable) {
      return res.status(400).json({ success: false, message: "Provider is currently unavailable." });
    }

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Check time slot conflict for this provider
    const conflict = await Booking.findOne({
      provider:          providerId,
      bookingDate:       new Date(bookingDate),
      status:            { $in: ["pending", "confirmed", "in-progress"] },
      "timeSlot.start":  timeSlot.start,
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked. Please choose another.",
      });
    }

    // Calculate total
    const totalAmount =
      service.pricingType === "fixed" ? service.price : provider.hourlyRate;

    const booking = await Booking.create({
      user:          req.user._id,
      provider:      providerId,
      service:       serviceId,
      bookingDate:   new Date(bookingDate),
      timeSlot,
      jobAddress,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      userNotes:     userNotes || "",
      status:        "pending",
    });

    // Increment service booking count
    await Service.findByIdAndUpdate(serviceId, { $inc: { bookingCount: 1 } });

    const populated = await Booking.findById(booking._id)
      .populate({ path: "provider", populate: { path: "user", select: "name avatar phone" } })
      .populate("service", "title category price")
      .populate("user",    "name phone avatar");

    res.status(201).json({
      success: true,
      message: "Booking created. Waiting for provider confirmation.",
      booking: populated,
    });
  } catch (error) {
    console.error("createBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/bookings/:id
// @desc    Get a single booking (owner, provider or admin)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "provider", populate: { path: "user", select: "name avatar phone" } })
      .populate("service", "title category price estimatedDuration")
      .populate("user",    "name avatar phone email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const providerUserId = booking.provider?.user?._id?.toString();
    const isOwner    = booking.user._id.toString() === req.user._id.toString();
    const isProvider = providerUserId             === req.user._id.toString();
    const isAdmin    = req.user.role              === "admin";

    if (!isOwner && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("getBookingById:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/bookings/provider/list
// @desc    Get all bookings for logged-in provider
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const getProviderBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, date } = req.query;

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider profile not found." });
    }

    const filter = { provider: provider._id };
    if (status) filter.status = status;

    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user",    "name avatar phone")
        .populate("service", "title category price")
        .sort({ bookingDate: 1 })
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
    console.error("getProviderBookings:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/confirm
// @desc    Provider confirms a pending booking
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const confirmBooking = async (req, res) => {
  try {
    const booking  = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a booking with status '${booking.status}'.`,
      });
    }

    booking.status      = "confirmed";
    booking.confirmedAt = new Date();
    await booking.save();

    res.status(200).json({ success: true, message: "Booking confirmed.", booking });
  } catch (error) {
    console.error("confirmBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/reject
// @desc    Provider rejects a pending booking
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const rejectBooking = async (req, res) => {
  try {
    const booking  = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be rejected." });
    }

    booking.status             = "rejected";
    booking.cancelledBy        = "provider";
    booking.cancellationReason = req.body.reason || "Provider unavailable";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking rejected.", booking });
  } catch (error) {
    console.error("rejectBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/start
// @desc    Provider marks booking as in-progress
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const startBooking = async (req, res) => {
  try {
    const booking  = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Only confirmed bookings can be started." });
    }

    booking.status = "in-progress";
    await booking.save();

    res.status(200).json({ success: true, message: "Job started!", booking });
  } catch (error) {
    console.error("startBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/complete
// @desc    Provider marks booking as completed
// @access  Private (provider)
// ────────────────────────────────────────────────────────────────────────────
const completeBooking = async (req, res) => {
  try {
    const booking  = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (booking.status !== "in-progress") {
      return res.status(400).json({ success: false, message: "Only in-progress bookings can be completed." });
    }

    booking.status      = "completed";
    booking.completedAt = new Date();
    await booking.save();

    // Increment provider's job counter
    await Provider.findByIdAndUpdate(provider._id, { $inc: { totalJobsDone: 1 } });

    res.status(200).json({
      success: true,
      message: "Job completed! Ask the customer to leave a review.",
      booking,
    });
  } catch (error) {
    console.error("completeBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/cancel
// @desc    User or provider cancels a booking
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const isUser     = booking.user.toString() === req.user._id.toString();
    const provider   = await Provider.findOne({ user: req.user._id });
    const isProvider = provider && booking.provider.toString() === provider._id.toString();
    const isAdmin    = req.user.role === "admin";

    if (!isUser && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (["completed", "cancelled", "rejected"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status '${booking.status}'.`,
      });
    }

    // Users: must cancel at least 2 hours before
    if (isUser && !isAdmin) {
      const diffHours = (new Date(booking.bookingDate) - new Date()) / (1000 * 60 * 60);
      if (diffHours < 2) {
        return res.status(400).json({
          success: false,
          message: "Cancellations must be made at least 2 hours before the booking time.",
        });
      }
    }

    booking.status             = "cancelled";
    booking.cancelledAt        = new Date();
    booking.cancelledBy        = isAdmin ? "admin" : isProvider ? "provider" : "user";
    booking.cancellationReason = req.body.reason || "";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled.", booking });
  } catch (error) {
    console.error("cancelBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/bookings/:id/reschedule
// @desc    User reschedules a pending/confirmed booking
// @access  Private (user)
// ────────────────────────────────────────────────────────────────────────────
const rescheduleBooking = async (req, res) => {
  try {
    const { bookingDate, timeSlot } = req.body;

    if (!bookingDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "New bookingDate and timeSlot are required.",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed bookings can be rescheduled.",
      });
    }

    // Check new slot conflict
    const conflict = await Booking.findOne({
      _id:              { $ne: booking._id },
      provider:         booking.provider,
      bookingDate:      new Date(bookingDate),
      status:           { $in: ["pending", "confirmed", "in-progress"] },
      "timeSlot.start": timeSlot.start,
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "The new time slot is already taken. Please choose another.",
      });
    }

    booking.bookingDate = new Date(bookingDate);
    booking.timeSlot    = timeSlot;
    booking.status      = "pending"; // reset — provider must re-confirm
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking rescheduled. Waiting for provider re-confirmation.",
      booking,
    });
  } catch (error) {
    console.error("rescheduleBooking:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/bookings/summary
// @desc    Booking status count summary for user or provider
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getBookingSummary = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "provider") {
      const provider = await Provider.findOne({ user: req.user._id });
      if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
      filter.provider = provider._id;
    } else {
      filter.user = req.user._id;
    }

    const [total, pending, confirmed, inProgress, completed, cancelled] =
      await Promise.all([
        Booking.countDocuments(filter),
        Booking.countDocuments({ ...filter, status: "pending" }),
        Booking.countDocuments({ ...filter, status: "confirmed" }),
        Booking.countDocuments({ ...filter, status: "in-progress" }),
        Booking.countDocuments({ ...filter, status: "completed" }),
        Booking.countDocuments({ ...filter, status: "cancelled" }),
      ]);

    res.status(200).json({
      success: true,
      summary: { total, pending, confirmed, inProgress, completed, cancelled },
    });
  } catch (error) {
    console.error("getBookingSummary:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getProviderBookings,
  confirmBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  rescheduleBooking,
  getBookingSummary,
};