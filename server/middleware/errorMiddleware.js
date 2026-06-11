// ── asyncHandler: wraps async route controllers to catch errors ───────────────
// Usage: router.get("/route", asyncHandler(async (req, res) => { ... }))
// Eliminates the need for try/catch in every controller
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Global error handler middleware ───────────────────────────────────────────
// Mount LAST in server.js: app.use(errorHandler)
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId (e.g. invalid _id format)
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError") { statusCode = 401; message = "Token expired. Please log in again."; }

  // Log in development only
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${statusCode} — ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ── 404 handler: mount before errorHandler ────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { asyncHandler, errorHandler, notFound };