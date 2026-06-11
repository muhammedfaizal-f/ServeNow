// src/api/services.js
// ─── All API call functions in ONE file ──────────────────────────────────────
// Import only what you need in each component

import api from "./axios";

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export const authAPI = {
  // POST /api/auth/register
  register: (data) => api.post("/auth/register", data),

  // POST /api/auth/login
  login: (email, password) => api.post("/auth/login", { email, password }),

  // GET /api/auth/me
  getMe: () => api.get("/auth/me"),

  // PUT /api/auth/change-password
  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),

  // POST /api/auth/forgot-password
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════

export const userAPI = {
  // GET /api/users/profile
  getProfile: () => api.get("/users/profile"),

  // PUT /api/users/profile
  updateProfile: (data) => api.put("/users/profile", data),

  // GET /api/users/bookings?status=pending&page=1
  getMyBookings: (params = {}) => api.get("/users/bookings", { params }),

  // GET /api/users/saved
  getSavedProviders: () => api.get("/users/saved"),

  // POST /api/users/saved/:providerId  (toggle save)
  toggleSaveProvider: (providerId) => api.post(`/users/saved/${providerId}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// PROVIDERS
// ══════════════════════════════════════════════════════════════════════════════

export const providerAPI = {
  // GET /api/providers?category=Plumbing&city=Coimbatore&sort=rating&page=1
  getAll: (params = {}) => api.get("/providers", { params }),

  // GET /api/providers/nearby?lat=11.01&lng=76.95&radius=10
  getNearby: (lat, lng, radius = 10, category = "") =>
    api.get("/providers/nearby", { params: { lat, lng, radius, category } }),

  // GET /api/providers/:id
  getById: (id) => api.get(`/providers/${id}`),

  // GET /api/providers/me
  getMyProfile: () => api.get("/providers/me"),

  // PUT /api/providers/me
  updateMyProfile: (data) => api.put("/providers/me", data),

  // GET /api/providers/me/dashboard
  getDashboard: () => api.get("/providers/me/dashboard"),

  // PATCH /api/providers/me/availability
  toggleAvailability: () => api.patch("/providers/me/availability"),
};

// ══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════════════════════════

export const bookingAPI = {
  // POST /api/bookings
  create: (data) => api.post("/bookings", data),

  // GET /api/bookings/:id
  getById: (id) => api.get(`/bookings/${id}`),

  // GET /api/bookings/summary
  getSummary: () => api.get("/bookings/summary"),

  // GET /api/bookings/provider/list?status=pending&page=1
  getProviderList: (params = {}) => api.get("/bookings/provider/list", { params }),

  getMyBookings: () => api.get("/bookings/my"),

  // PATCH /api/bookings/:id/confirm
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),

  // PATCH /api/bookings/:id/reject
  reject: (id, reason = "") => api.patch(`/bookings/${id}/reject`, { reason }),

  // PATCH /api/bookings/:id/start
  start: (id) => api.patch(`/bookings/${id}/start`),

  // PATCH /api/bookings/:id/complete
  complete: (id) => api.patch(`/bookings/${id}/complete`),

  // PATCH /api/bookings/:id/cancel
  cancel: (id, reason = "") => api.patch(`/bookings/${id}/cancel`, { reason }),

  // PATCH /api/bookings/:id/reschedule
  reschedule: (id, bookingDate, timeSlot) =>
    api.patch(`/bookings/${id}/reschedule`, { bookingDate, timeSlot }),
};

// ══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════════════════════════

export const serviceAPI = {
  // GET /api/services?category=Plumbing&search=pipe
  getAll: (params = {}) => api.get("/services", { params }),

  // GET /api/services/categories
  getCategories: () => api.get("/services/categories"),

  // GET /api/services/popular
  getPopular: () => api.get("/services/popular"),

  // GET /api/services/category/:category
  getByCategory: (category, params = {}) =>
    api.get(`/services/category/${category}`, { params }),

  // GET /api/services/:id
  getById: (id) => api.get(`/services/${id}`),

  // GET /api/services/provider/my
  getMyServices: () => api.get("/services/provider/my"),

  // POST /api/services
  create: (data) => api.post("/services", data),

  // PUT /api/services/:id
  update: (id, data) => api.put(`/services/${id}`, data),

  // DELETE /api/services/:id
  delete: (id) => api.delete(`/services/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════════════════════

export const reviewAPI = {
  // POST /api/reviews
  create: (data) => api.post("/reviews", data),

  // GET /api/reviews/provider/:providerId?sort=newest&page=1
  getProviderReviews: (providerId, params = {}) =>
    api.get(`/reviews/provider/${providerId}`, { params }),

  // GET /api/reviews/my
  getMyReviews: () => api.get("/reviews/my"),

  // PUT /api/reviews/:id
  update: (id, data) => api.put(`/reviews/${id}`, data),

  // DELETE /api/reviews/:id
  delete: (id) => api.delete(`/reviews/${id}`),

  // PATCH /api/reviews/:id/helpful
  toggleHelpful: (id) => api.patch(`/reviews/${id}/helpful`),

  // PATCH /api/reviews/:id/flag
  flag: (id, reason) => api.patch(`/reviews/${id}/flag`, { reason }),
};