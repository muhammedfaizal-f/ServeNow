const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ── Relationships ─────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // one review per booking only
    },

    // ── Rating ────────────────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    // ── Review content ────────────────────────────────────────────────────────
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [500, "Review cannot exceed 500 characters"],
    },

    // ── Sub-ratings (optional granular feedback) ──────────────────────────────
    subRatings: {
      punctuality: { type: Number, min: 1, max: 5 },
      quality: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },

    // ── Helpful votes ─────────────────────────────────────────────────────────
    helpfulVotes: {
      type: Number,
      default: 0,
    },

    helpfulVotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Moderation ────────────────────────────────────────────────────────────
    isVisible: {
      type: Boolean,
      default: true,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
reviewSchema.index({ provider: 1, createdAt: -1 }); // latest reviews per provider
reviewSchema.index({ user: 1 });                     // reviews by a user


// ── After saving a review, recalculate provider's average rating ──────────────
reviewSchema.post("save", async function () {
  const Provider = mongoose.model("Provider");

  const stats = await mongoose.model("Review").aggregate([
    { $match: { provider: this.provider, isVisible: true } },
    {
      $group: {
        _id: "$provider",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Provider.findByIdAndUpdate(this.provider, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
});

// ── After deleting a review, recalculate too ─────────────────────────────────
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const Provider = mongoose.model("Provider");

  const stats = await mongoose.model("Review").aggregate([
    { $match: { provider: doc.provider, isVisible: true } },
    {
      $group: {
        _id: "$provider",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Provider.findByIdAndUpdate(doc.provider, {
    averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
  });
});

module.exports = mongoose.model("Review", reviewSchema);