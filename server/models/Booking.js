const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ── Booking details ───────────────────────────────────────────────────────
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },

    timeSlot: {
      start: { type: String, required: true }, // "10:00 AM"
      end: { type: String, required: true }, // "12:00 PM"
    },

    // ── Address for the job ───────────────────────────────────────────────────
    jobAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "Tamil Nadu" },
      pincode: { type: String, required: true },
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },

    // ── Booking status flow ───────────────────────────────────────────────────
    // pending → confirmed → in-progress → completed
    //         ↘ cancelled (by user or provider)
    status: {
      type: String,
      enum: [
        "pending",      // user just booked, waiting for provider to confirm
        "confirmed",    // provider accepted
        "in-progress",  // provider has started the job
        "completed",    // job done
        "cancelled",    // cancelled by user or provider
        "rejected",     // provider rejected the booking
      ],
      default: "pending",
    },

    // ── Cancellation ─────────────────────────────────────────────────────────
    cancelledBy: {
      type: String,
      enum: ["user", "provider", "admin", ""],
      default: "",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    // ── Notes ─────────────────────────────────────────────────────────────────
    userNotes: {
      type: String,
      maxlength: [300, "Notes cannot exceed 300 characters"],
      default: "",
    },

    // ── Review tracking ───────────────────────────────────────────────────────
    isReviewed: {
      type: Boolean,
      default: false,
    },

    // ── Timestamps for status changes ─────────────────────────────────────────
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

// ── Pre-save hook — auto-set timestamps on status change ──────────────────────
// IMPORTANT: must use function(next) NOT async function — otherwise next breaks
bookingSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    if (this.status === "confirmed")    this.confirmedAt  = now;
    if (this.status === "completed")    this.completedAt  = now;
    if (this.status === "cancelled")    this.cancelledAt  = now;
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);