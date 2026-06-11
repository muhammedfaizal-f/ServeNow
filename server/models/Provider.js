const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    // ── Link to User account ──────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Basic info ────────────────────────────────────────────────────────────
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    // ── Service details ───────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "Plumbing",
        "Electrician",
        "Home Cleaning",
        "Painting",
        "AC Repair",
        "Carpentry",
        "Tutoring",
        "Pet Care",
        "Gardening",
        "Moving Help",
        "Locksmith",
        "Home Cook",
      ],
    },

    skills: {
      type: [String], // e.g. ["Pipe Repair", "Leak Fix", "Tap Install"]
      default: [],
    },

    experience: {
      type: Number, // years of experience
      min: 0,
      default: 0,
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Rate cannot be negative"],
    },

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "Coimbatore" },
      state: { type: String, default: "Tamil Nadu" },
      pincode: { type: String, default: "" },
      // GeoJSON for map-based queries
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },

    // ── Availability ──────────────────────────────────────────────────────────
    isAvailable: {
      type: Boolean,
      default: true,
    },

    availableDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },

    workingHours: {
      start: { type: String, default: "08:00" }, // "08:00"
      end: { type: String, default: "20:00" }, // "20:00"
    },

    // ── Ratings ───────────────────────────────────────────────────────────────
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // ── Stats ─────────────────────────────────────────────────────────────────
    totalJobsDone: {
      type: Number,
      default: 0,
    },

    responseTime: {
      type: String, // e.g. "~10 mins"
      default: "~15 mins",
    },

    // ── Documents (for verification) ─────────────────────────────────────────
    idProof: {
      type: String, // URL to uploaded ID image
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    badge: {
      type: String,
      enum: ["Top Rated", "Pro Verified", "Most Booked", "New & Rising", "Fast Response", ""],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Index for geo-based queries (find providers near user) ───────────────────
providerSchema.index({ "location.coordinates": "2dsphere" });

// ── Index for fast category + city filtering ─────────────────────────────────
providerSchema.index({ category: 1, "location.city": 1 });

// ── Virtual: full location string ────────────────────────────────────────────
providerSchema.virtual("fullLocation").get(function () {
  return `${this.location.address}, ${this.location.city}`;
});

module.exports = mongoose.model("Provider", providerSchema);