const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require('dotenv').config()

process.env.PORT        // → 5000
process.env.MONGO_URI   // → mongodb://localhost:27017/servenow
process.env.JWT_SECRET  // → servenow_secret_key_2025
// ── Load env vars first ───────────────────────────────────────────────────────
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────────────────────────
const connectDB = require("./config/db");
connectDB();

// ── Import routes ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const providerRoutes = require("./routes/providerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ── Import middleware ─────────────────────────────────────────────────────────
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ── Init Express ──────────────────────────────────────────────────────────────
const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────

// CORS — allow frontend origin
const allowedOrigins = [
  "http://localhost:5173",
  "https://serve-now-eight.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));          // parse JSON bodies
app.use(express.urlencoded({ extended: true }));    // parse form data

// HTTP request logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check route ────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 ServeNow API is running",
    version: "1.0.0",
    env: process.env.NODE_ENV,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// ── Serve static uploads (profile photos, etc.) ───────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);      // 404 handler
app.use(errorHandler);  // global error handler

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 ServeNow API Server Running       ║
  ║   Port    : ${PORT}                       ║
  ║   Mode    : ${process.env.NODE_ENV || "development"}               ║
  ║   URL     : http://localhost:${PORT}      ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;