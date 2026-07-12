const mongoose = require("mongoose");
const { Review, Booking, Provider } = require("../models");

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/reviews
// @desc    User posts a review after a completed booking
// @access  Private (user)
// ────────────────────────────────────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, subRatings } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "bookingId, rating and comment are required.",
      });
    }

    // Fetch booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Only completed bookings can be reviewed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review a completed booking.",
      });
    }

    // Prevent duplicate review for same booking
    if (booking.isReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    // Create the review
    const review = await Review.create({
      user:       req.user._id,
      provider:   booking.provider,
      booking:    bookingId,
      rating,
      comment,
      subRatings: subRatings || {},
    });

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    // Note: provider averageRating is auto-updated via Review post-save hook (Section 1)

    const populated = await Review.findById(review._id)
      .populate("user",    "name avatar")
      .populate("provider","category averageRating");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully. Thank you!",
      review:  populated,
    });
  } catch (error) {
    // Unique index on booking — duplicate review attempt
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("createReview:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/reviews/provider/:providerId
// @desc    Get all reviews for a provider with pagination
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getProviderReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "newest", rating } = req.query;

    const filter = {
      provider:  req.params.providerId,
      isVisible: true,
    };
    if (rating) filter.rating = Number(rating);

    const sortOptions = {
      newest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      highest: { rating: -1 },
      lowest:  { rating:  1 },
      helpful: { helpfulVotes: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    // Rating distribution (1★ to 5★ counts)
    const distribution = await Review.aggregate([
      { $match: { provider: require("mongoose").Types.ObjectId(req.params.providerId), isVisible: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach((d) => { ratingDist[d._id] = d.count; });

    res.status(200).json({
      success:      true,
      total,
      page:         Number(page),
      totalPages:   Math.ceil(total / Number(limit)),
      ratingDist,
      reviews,
    });
  } catch (error) {
    console.error("getProviderReviews:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/reviews/my
// @desc    Get all reviews written by the logged-in user
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate({
        path: "provider",
        select: "category averageRating",
        populate: { path: "user", select: "name avatar" },
      })
      .populate("booking", "bookingDate timeSlot totalAmount")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: reviews.length, reviews });
  } catch (error) {
    console.error("getMyReviews:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/reviews/:id
// @desc    Get a single review by ID
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user",     "name avatar")
      .populate("provider", "category averageRating")
      .populate("booking",  "bookingDate timeSlot");

    if (!review || !review.isVisible) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("getReviewById:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/reviews/:id
// @desc    User updates their own review
// @access  Private (review owner)
// ────────────────────────────────────────────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const { rating, comment, subRatings } = req.body;

    if (rating)     review.rating     = rating;
    if (comment)    review.comment    = comment;
    if (subRatings) review.subRatings = subRatings;

    await review.save(); // post-save hook recalculates provider avg rating

    res.status(200).json({
      success: true,
      message: "Review updated.",
      review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("updateReview:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/reviews/:id
// @desc    User deletes their own review (admin can delete any)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await Review.findOneAndDelete({ _id: review._id });
    // post findOneAndDelete hook auto-recalculates provider avg rating

    // Unmark booking as reviewed so user can re-review if needed
    await Booking.findByIdAndUpdate(review.booking, { isReviewed: false });

    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (error) {
    console.error("deleteReview:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/reviews/:id/helpful
// @desc    Toggle helpful vote on a review
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Prevent voting on own review
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot vote on your own review.",
      });
    }

    const alreadyVoted = review.helpfulVotedBy
      .map(String)
      .includes(req.user._id.toString());

    if (alreadyVoted) {
      // Remove vote
      review.helpfulVotedBy = review.helpfulVotedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add vote
      review.helpfulVotedBy.push(req.user._id);
      review.helpfulVotes += 1;
    }

    await review.save();

    res.status(200).json({
      success:      true,
      message:      alreadyVoted ? "Vote removed." : "Marked as helpful.",
      helpfulVotes: review.helpfulVotes,
      voted:        !alreadyVoted,
    });
  } catch (error) {
    console.error("toggleHelpful:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/reviews/:id/flag
// @desc    Flag a review as inappropriate
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const flagReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.isFlagged) {
      return res.status(400).json({
        success: false,
        message: "This review has already been flagged.",
      });
    }

    review.isFlagged  = true;
    review.flagReason = req.body.reason || "Reported by user";
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review flagged. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("flagReview:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleHelpful,
  flagReview,
};