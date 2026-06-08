// src/pages/ProviderProfile.jsx
import { useAuth } from '../context/AuthContext';
import { providerAPI, bookingAPI, reviewAPI } from '../api/services';
import './ProviderProfile.css';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "bookings", label: "My Bookings", icon: "📅" },
  { id: "services", label: "My Services", icon: "🛠" },
  { id: "profile", label: "Edit Profile", icon: "👤" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
  confirmed: { label: "Confirmed", color: "#4A90E2", bg: "rgba(74,144,226,.12)" },
  "in-progress": { label: "In Progress", color: "#A78BFA", bg: "rgba(167,139,250,.12)" },
  completed: { label: "Completed", color: "#10B981", bg: "rgba(16,185,129,.12)" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,.12)" },
  rejected: { label: "Rejected", color: "#6B7280", bg: "rgba(107,114,128,.12)" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const catIcon = (cat = "") => {
  const map = { Plumbing: "🔧", Electrician: "⚡", "Home Cleaning": "🧹", Painting: "🎨", "AC Repair": "❄️", Carpentry: "🛠", Tutoring: "📚", "Pet Care": "🐾", Gardening: "🪴", "Moving Help": "📦", Locksmith: "🔑", "Home Cook": "🍳" };
  return map[cat] || "🛠";
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: bg, color, border: `0.5px solid ${color}30`, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const Stars = ({ r, c = "#F59E0B" }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width="12" height="12"
        fill={i <= Math.floor(r) ? c : "none"} stroke={i <= Math.floor(r) ? c : "rgba(255,255,255,.2)"} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProviderProfile() {
  const navigate = useNavigate();

  // ── Global state ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, booking }
  const { logout } = useAuth();
  // ── Provider data ─────────────────────────────────────────────────────────
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [recentBks, setRecentBks] = useState([]);

  // ── Bookings ──────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [bkStatus, setBkStatus] = useState("all");
  const [bkPage, setBkPage] = useState(1);
  const [bkTotal, setBkTotal] = useState(0);
  const [bkDate, setBkDate] = useState("");

  // ── Services ──────────────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [svcLoading, setSvcLoading] = useState(false);

  // ── Profile edit ──────────────────────────────────────────────────────────
  const [editLoading, setEditLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: "", hourlyRate: "", responseTime: "",
    isAvailable: true, availableDays: [],
    startTime: "08:00", endTime: "20:00",
  });

  // ── Cancel modal state ────────────────────────────────────────────────────
  const [cancelReason, setCancelReason] = useState("");

  const LIMIT = 10;

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHERS
  // ─────────────────────────────────────────────────────────────────────────

  // Load provider profile + dashboard
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, dashRes] = await Promise.all([
        api.get("/providers/me"),
        api.get("/providers/me/dashboard"),
      ]);
      const p = meRes.data.provider;
      setProvider(p);
      setUser(p.user || {});
      setDashStats(dashRes.data.stats);
      setRecentBks(dashRes.data.recentBookings || []);
      // pre-fill profile form
      setProfileForm({
        bio: p.bio || "",
        hourlyRate: p.hourlyRate || "",
        responseTime: p.responseTime || "~15 mins",
        isAvailable: p.isAvailable ?? true,
        availableDays: p.availableDays || [],
        startTime: p.workingHours?.start || "08:00",
        endTime: p.workingHours?.end || "20:00",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load dashboard", "error");
    } finally { setLoading(false); }
  }, []);

  // Load bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: bkPage, limit: LIMIT };
      if (bkStatus !== "all") params.status = bkStatus;
      if (bkDate) params.date = bkDate;
      const res = await api.get("/bookings/provider/list", { params });
      setBookings(res.data.bookings || []);
      setBkTotal(res.data.total || 0);
    } catch (err) {
      showToast("Failed to load bookings", "error");
    } finally { setLoading(false); }
  }, [bkStatus, bkPage, bkDate]);

  // Load services
  const fetchServices = useCallback(async () => {
    setSvcLoading(true);
    try {
      const res = await api.get("/services/provider/my");
      setServices(res.data.services || []);
    } catch (err) {
      showToast("Failed to load services", "error");
    } finally { setSvcLoading(false); }
  }, []);

  // Load on tab change
  useEffect(() => {
    if (tab === "overview") fetchDashboard();
    if (tab === "bookings") fetchBookings();
    if (tab === "services") fetchServices();
    if (tab === "profile") fetchDashboard();
  }, [tab]);

  useEffect(() => {
    if (tab === "bookings") fetchBookings();
  }, [bkStatus, bkPage, bkDate]);

  // ─────────────────────────────────────────────────────────────────────────
  // BOOKING ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const confirmBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/confirm`);
      showToast("Booking confirmed! ✅");
      fetchBookings(); if (tab === "overview") fetchDashboard();
    } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
  };

  const rejectBooking = async (id, reason) => {
    try {
      await api.patch(`/bookings/${id}/reject`, { reason });
      showToast("Booking rejected.");
      setModal(null); fetchBookings();
    } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
  };

  const startBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/start`);
      showToast("Job started! 🔧");
      fetchBookings();
    } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
  };

  const completeBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/complete`);
      showToast("Job completed! 🎉 Ask the customer to leave a review.");
      fetchBookings(); if (tab === "overview") fetchDashboard();
    } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
  };

  const cancelBooking = async (id, reason) => {
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason });
      showToast("Booking cancelled.");
      setModal(null); setCancelReason(""); fetchBookings();
    } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const toggleAvailability = async () => {
    try {
      const res = await api.patch("/providers/me/availability");
      setProvider(p => ({ ...p, isAvailable: res.data.isAvailable }));
      setProfileForm(f => ({ ...f, isAvailable: res.data.isAvailable }));
      showToast(res.data.message);
    } catch (err) { showToast("Error", "error"); }
  };

  const saveProfile = async () => {
    setEditLoading(true);
    try {
      await api.put("/providers/me", {
        bio: profileForm.bio,
        hourlyRate: Number(profileForm.hourlyRate),
        responseTime: profileForm.responseTime,
        isAvailable: profileForm.isAvailable,
        availableDays: profileForm.availableDays,
        workingHours: { start: profileForm.startTime, end: profileForm.endTime },
      });
      showToast("Profile updated successfully! ✅");
      fetchDashboard();
    } catch (err) {
      showToast(err?.response?.data?.message || "Update failed", "error");
    } finally { setEditLoading(false); }
  };

  const toggleDay = (d) => {
    setProfileForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(d)
        ? f.availableDays.filter(x => x !== d)
        : [...f.availableDays, d],
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SERVICE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const toggleService = async (id, isActive) => {
    try {
      await api.put(`/services/${id}`, { isActive: !isActive });
      showToast(!isActive ? "Service activated." : "Service deactivated.");
      fetchServices();
    } catch (err) { showToast("Error", "error"); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const BookingActionBtns = ({ b }) => {
    const acts = [];
    if (b.status === "pending") {
      acts.push(
        <button key="confirm" onClick={() => confirmBooking(b._id)}
          style={btnStyle("#34D399", "rgba(16,185,129,.08)", "rgba(16,185,129,.25)")}>✓ Confirm</button>,
        <button key="reject" onClick={() => setModal({ type: "reject", booking: b })}
          style={btnStyle("#F87171", "rgba(239,68,68,.08)", "rgba(239,68,68,.25)")}>✕ Reject</button>
      );
    }
    if (b.status === "confirmed") {
      acts.push(
        <button key="start" onClick={() => startBooking(b._id)}
          style={btnStyle("#A78BFA", "rgba(167,139,250,.08)", "rgba(167,139,250,.25)")}>▶ Start Job</button>,
        <button key="cancel" onClick={() => setModal({ type: "cancel", booking: b })}
          style={btnStyle("#F87171", "rgba(239,68,68,.06)", "rgba(239,68,68,.2)")}>Cancel</button>
      );
    }
    if (b.status === "in-progress") {
      acts.push(
        <button key="complete" onClick={() => completeBooking(b._id)}
          style={btnStyle("#10B981", "rgba(16,185,129,.08)", "rgba(16,185,129,.25)")}>✓ Mark Complete</button>
      );
    }
    return acts.length ? <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{acts}</div> : null;
  };

  const btnStyle = (color, bg, border) => ({
    padding: "6px 12px", borderRadius: 8, border: `0.5px solid ${border}`,
    background: bg, color, fontSize: 12.5, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", transition: "all .2s",
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (!provider && loading) return (
    <div style={{ minHeight: "100vh", background: "#060D25", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 42, height: 42, border: "3px solid rgba(255,107,53,.2)", borderTopColor: "#FF6B35", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Loading your dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const avatarInitials = initials(user?.name || "Provider");

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────

  return (
    <>
      <div className="pv">

        {/* ── Toast ── */}
        {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✓" : "⚠"} {toast.msg}</div>}

        {/* ── Cancel / Reject modal ── */}
        {modal && (
          <div className="modal-overlay" onClick={() => { setModal(null); setCancelReason(""); }}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-h">
                {modal.type === "cancel" ? "Cancel Booking" : "Reject Booking"}
              </div>
              <div className="modal-sub">
                {modal.type === "cancel"
                  ? `Cancel booking from ${modal.booking.user?.name || "Customer"}? This cannot be undone.`
                  : `Reject pending booking from ${modal.booking.user?.name || "Customer"}?`
                }
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)", marginBottom: 7 }}>
                  Reason {modal.type === "reject" ? "(required)" : "(optional)"}
                </div>
                <textarea
                  className="modal-ta"
                  placeholder={modal.type === "cancel" ? "e.g. Unavailable on that day…" : "e.g. Already booked at that time…"}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
              <div className="modal-btns">
                <button className="modal-cancel-btn" onClick={() => { setModal(null); setCancelReason(""); }}>
                  Keep Booking
                </button>
                <button
                  className="modal-confirm-btn"
                  style={{ background: modal.type === "cancel" ? "#EF4444" : "#F59E0B", color: "white" }}
                  onClick={() => {
                    if (modal.type === "cancel") cancelBooking(modal.booking._id, cancelReason);
                    else rejectBooking(modal.booking._id, cancelReason);
                  }}
                >
                  {modal.type === "cancel" ? "Yes, Cancel" : "Reject Booking"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav className="pv-nav">
          <div className="pv-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
          <div className="pv-nav-div" />
          <span className="pv-nav-title">Provider Dashboard</span>
          <div className="pv-nav-right">
            {/* live availability toggle */}
            {provider && (
              <div
                className="avail-pill"
                style={{
                  background: provider.isAvailable ? "rgba(16,185,129,.1)" : "rgba(100,100,100,.1)",
                  border: `0.5px solid ${provider.isAvailable ? "rgba(16,185,129,.25)" : "rgba(255,255,255,.1)"}`,
                  color: provider.isAvailable ? "#34D399" : "rgba(255,255,255,.45)",
                }}
                onClick={toggleAvailability}
              >
                <span className="avail-dot" style={{ background: provider.isAvailable ? "#10B981" : "#6B7280" }} />
                {provider.isAvailable ? "Available" : "Busy / Unavailable"}
              </div>
            )}
            <button className="pv-logout"  onClick={logout}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign Out
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        {provider && (
          <div className="pv-hero">
            <div className="hb hb1" /><div className="hb hb2" />
            <div className="hero-inner">
              <div className="av-ring">
                <div className="av-inner">{avatarInitials}</div>
              </div>
              <div className="hero-info">
                <h1 className="hero-name">{user?.name || "Provider"}</h1>
                <p className="hero-role">{provider.category} Expert · {provider.location?.city || "Coimbatore"}</p>
                <div className="hero-tags">
                  <span className="hero-tag" style={{ background: provider.isVerified ? "rgba(16,185,129,.12)" : "rgba(245,158,11,.12)", color: provider.isVerified ? "#34D399" : "#F59E0B", border: `0.5px solid ${provider.isVerified ? "rgba(16,185,129,.25)" : "rgba(245,158,11,.25)"}` }}>
                    {provider.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
                  </span>
                  <span className="hero-tag" style={{ background: "rgba(255,107,53,.1)", color: "#FF8C5A", border: "0.5px solid rgba(255,107,53,.25)" }}>
                    ₹{provider.hourlyRate}/hr
                  </span>
                  <span className="hero-tag" style={{ background: "rgba(74,144,226,.1)", color: "#60A5FA", border: "0.5px solid rgba(74,144,226,.25)" }}>
                    ⏱ {provider.responseTime}
                  </span>
                  {provider.badge && (
                    <span className="hero-tag" style={{ background: "rgba(167,139,250,.1)", color: "#C4B5FD", border: "0.5px solid rgba(167,139,250,.25)" }}>
                      🏅 {provider.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* stats bar */}
            {dashStats && (
              <div className="hero-stats" style={{ maxWidth: 1100, margin: "24px auto 0", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                {[
                  { ic: "📦", val: dashStats.totalBookings, lbl: "Total Bookings" },
                  { ic: "✅", val: dashStats.completedBookings, lbl: "Completed" },
                  { ic: "⏳", val: dashStats.pendingBookings, lbl: "Pending" },
                  { ic: "💰", val: `₹${(dashStats.totalEarnings || 0).toLocaleString()}`, lbl: "Total Earned" },
                  { ic: "⭐", val: `${dashStats.averageRating || 0}★`, lbl: "Avg Rating" },
                ].map((s, i, a) => (
                  <div key={i} style={{ display: "flex", flex: 1 }}>
                    <div className="hs-item">
                      <div className="hs-ic">{s.ic}</div>
                      <div className="hs-val">{s.val}</div>
                      <div className="hs-lbl">{s.lbl}</div>
                    </div>
                    {i < a.length - 1 && <div className="hs-div" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="pv-tabs">
          {TABS.map(t => {
            const pendingCount = t.id === "bookings" && dashStats ? dashStats.pendingBookings : 0;
            return (
              <button key={t.id} className={`pv-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
                {pendingCount > 0 && <span className="pv-tab-badge">{pendingCount}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="pv-body">

          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <>
              {loading && !dashStats ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 36, height: 36, border: "3px solid rgba(255,107,53,.2)", borderTopColor: "#FF6B35", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                </div>
              ) : dashStats ? (
                <>
                  {/* stat cards */}
                  <div className="stat-grid">
                    {[
                      { ic: "📦", v: dashStats.totalBookings, l: "Total Bookings", bg: "rgba(74,144,226,.12)" },
                      { ic: "✅", v: dashStats.completedBookings, l: "Completed Jobs", bg: "rgba(16,185,129,.12)" },
                      { ic: "💰", v: `₹${(dashStats.totalEarnings || 0).toLocaleString()}`, l: "Total Earnings", bg: "rgba(255,107,53,.12)" },
                      { ic: "⭐", v: `${dashStats.averageRating || 0}★`, l: "Avg Rating", bg: "rgba(245,158,11,.12)" },
                    ].map((s, i) => (
                      <div className="stat-card" key={i}>
                        <div className="sc-ic" style={{ background: s.bg }}>{s.ic}</div>
                        <div className="sc-val">{s.v}</div>
                        <div className="sc-lbl">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* recent bookings */}
                  {recentBks.length > 0 && (
                    <>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "white", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Recent Bookings
                        <span style={{ fontSize: 13, color: "#FF6B35", cursor: "pointer", fontWeight: 400 }} onClick={() => setTab("bookings")}>See all →</span>
                      </div>
                      <div className="bk-list">
                        {recentBks.slice(0, 4).map(b => {
                          const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                          return (
                            <div className="bk-card" key={b._id}>
                              <div className="bk-card-top">
                                <div className="bk-av" style={{ background: "rgba(74,144,226,.15)", color: "#4A90E2" }}>
                                  {b.user?.name?.slice(0, 2).toUpperCase() || "??"}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div className="bk-name">{b.user?.name || "Customer"}</div>
                                  <div className="bk-sub">{b.service?.title || "—"}</div>
                                </div>
                                <Badge label={b.status} color={sc.color} bg={sc.bg} />
                              </div>
                              <div className="bk-card-footer">
                                <div className="bk-amt">₹{b.totalAmount}</div>
                                <BookingActionBtns b={b} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </>
          )}

          {/* ════ BOOKINGS ════ */}
          {tab === "bookings" && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "white", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                My Bookings
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontWeight: 400 }}>Total: {bkTotal}</span>
              </div>

              {/* filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                <div className="bk-filters" style={{ margin: 0 }}>
                  {[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["in-progress", "In Progress"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
                    <button key={v} className={`bk-filter ${bkStatus === v ? "on" : ""}`} onClick={() => { setBkStatus(v); setBkPage(1); }}>
                      {l}
                      {v === "pending" && dashStats?.pendingBookings > 0 && (
                        <span style={{ marginLeft: 5, background: "rgba(255,107,53,.2)", color: "#FF8C5A", fontSize: 10, padding: "1px 6px", borderRadius: 999 }}>{dashStats.pendingBookings}</span>
                      )}
                    </button>
                  ))}
                </div>
                <input type="date" className="date-input" value={bkDate} onChange={e => setBkDate(e.target.value)} title="Filter by date" />
                {bkDate && <button onClick={() => setBkDate("")} style={{ padding: "7px 12px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12.5, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Clear date</button>}
              </div>

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 32, height: 32, border: "3px solid rgba(255,107,53,.2)", borderTopColor: "#FF6B35", borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>
              ) : bookings.length === 0 ? (
                <div className="pv-empty"><div className="pv-empty-ic">📭</div>No bookings found.</div>
              ) : (
                <>
                  <div className="bk-list">
                    {bookings.map(b => {
                      const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                      return (
                        <div className="bk-card" key={b._id}>
                          <div className="bk-card-top">
                            <div className="bk-av" style={{ background: "rgba(74,144,226,.15)", color: "#4A90E2" }}>
                              {b.user?.name?.slice(0, 2).toUpperCase() || "??"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="bk-name">{b.user?.name || "Customer"}</div>
                              <div className="bk-sub">{b.service?.title || "Service"} · {b.service?.category}</div>
                              <div className="bk-meta-row">
                                <span className="bk-meta-item">
                                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                  {new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                                <span className="bk-meta-item">
                                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                  {b.timeSlot?.start}
                                </span>
                                <span className="bk-meta-item">
                                  💳 {b.paymentMethod === "online" ? "Online" : "Cash"}
                                </span>
                                {b.user?.phone && (
                                  <span className="bk-meta-item">📞 {b.user.phone}</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                              <div className="bk-amt">₹{b.totalAmount}</div>
                              <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                            </div>
                          </div>

                          {/* address */}
                          {b.jobAddress && (
                            <div className="bk-addr">
                              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              {b.jobAddress.street}, {b.jobAddress.city} - {b.jobAddress.pincode}
                            </div>
                          )}

                          {/* notes */}
                          {b.userNotes && (
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.38)", marginTop: 8, padding: "8px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, fontStyle: "italic" }}>
                              📝 "{b.userNotes}"
                            </div>
                          )}

                          {/* cancellation reason */}
                          {b.status === "cancelled" && b.cancellationReason && (
                            <div style={{ fontSize: 12, color: "rgba(239,68,68,.7)", marginTop: 8, padding: "7px 12px", background: "rgba(239,68,68,.06)", borderRadius: 8, border: "0.5px solid rgba(239,68,68,.15)" }}>
                              Reason: {b.cancellationReason}
                            </div>
                          )}

                          {/* action buttons */}
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid rgba(255,255,255,.06)" }}>
                            <BookingActionBtns b={b} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* pagination */}
                  {bkTotal > LIMIT && (
                    <div className="pag">
                      <div className="pag-info">Showing {Math.min(LIMIT, bookings.length)} of {bkTotal}</div>
                      <div className="pag-btns">
                        {bkPage > 1 && <button className="pag-btn" onClick={() => setBkPage(p => p - 1)}>←</button>}
                        {Array.from({ length: Math.ceil(bkTotal / LIMIT) }, (_, i) => (
                          <button key={i} className={`pag-btn ${bkPage === i + 1 ? "on" : ""}`} onClick={() => setBkPage(i + 1)}>{i + 1}</button>
                        ))}
                        {bkPage < Math.ceil(bkTotal / LIMIT) && <button className="pag-btn" onClick={() => setBkPage(p => p + 1)}>→</button>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ════ SERVICES ════ */}
          {tab === "services" && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "white", marginBottom: 18 }}>
                My Services
              </div>
              {svcLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 32, height: 32, border: "3px solid rgba(255,107,53,.2)", borderTopColor: "#FF6B35", borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>
              ) : services.length === 0 ? (
                <div className="pv-empty"><div className="pv-empty-ic">🛠</div>No services yet. Contact admin to add services.</div>
              ) : (
                <div className="svc-grid">
                  {services.map(s => (
                    <div className="svc-card" key={s._id} style={s.isActive ? {} : { opacity: .6 }}>
                      <div className="svc-icon">{catIcon(s.category)}</div>
                      <div className="svc-title">{s.title}</div>
                      <div className="svc-desc">{s.description}</div>
                      <div className="svc-footer">
                        <div>
                          <div className="svc-price">₹{s.price}</div>
                          <div className="svc-dur">⏱ {s.estimatedDuration} min · {s.pricingType}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <Badge label={s.isActive ? "Active" : "Inactive"} color={s.isActive ? "#10B981" : "#6B7280"} bg={s.isActive ? "rgba(16,185,129,.1)" : "rgba(107,114,128,.1)"} />
                          <button
                            onClick={() => toggleService(s._id, s.isActive)}
                            style={{ fontSize: 12, padding: "4px 10px", borderRadius: 7, border: `0.5px solid ${s.isActive ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}`, background: s.isActive ? "rgba(239,68,68,.06)" : "rgba(16,185,129,.06)", color: s.isActive ? "#F87171" : "#34D399", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                            {s.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Bookings: {s.bookingCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════ PROFILE EDIT ════ */}
          {tab === "profile" && provider && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "white", marginBottom: 18 }}>Edit Profile</div>
              <div className="pf-grid">
                {/* left */}
                <div className="pf-card">
                  <div className="pf-h">📝 About You</div>
                  <div className="pf-field">
                    <label className="pf-lbl">Short Bio</label>
                    <textarea className="pf-ta" placeholder="Experienced professional with X years…" value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
                  </div>
                  <div className="pf-frow">
                    <div className="pf-field" style={{ marginBottom: 0 }}>
                      <label className="pf-lbl">Hourly Rate (₹)</label>
                      <input className="pf-input" type="number" placeholder="299" value={profileForm.hourlyRate} onChange={e => setProfileForm(f => ({ ...f, hourlyRate: e.target.value }))} />
                    </div>
                    <div className="pf-field" style={{ marginBottom: 0 }}>
                      <label className="pf-lbl">Response Time</label>
                      <input className="pf-input" placeholder="~10 mins" value={profileForm.responseTime} onChange={e => setProfileForm(f => ({ ...f, responseTime: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* right */}
                <div className="pf-card">
                  <div className="pf-h">📅 Availability</div>
                  <div className="pf-field">
                    <label className="pf-lbl">Working Days</label>
                    <div className="days-row">
                      {DAYS.map(d => (
                        <button key={d} className={`day-btn ${profileForm.availableDays.includes(d) ? "on" : ""}`} onClick={() => toggleDay(d)}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pf-frow">
                    <div className="pf-field" style={{ marginBottom: 0 }}>
                      <label className="pf-lbl">Start Time</label>
                      <input className="pf-input" type="time" value={profileForm.startTime} onChange={e => setProfileForm(f => ({ ...f, startTime: e.target.value }))} />
                    </div>
                    <div className="pf-field" style={{ marginBottom: 0 }}>
                      <label className="pf-lbl">End Time</label>
                      <input className="pf-input" type="time" value={profileForm.endTime} onChange={e => setProfileForm(f => ({ ...f, endTime: e.target.value }))} />
                    </div>
                  </div>
                  <div className="pf-field" style={{ marginTop: 14, marginBottom: 0 }}>
                    <label className="pf-lbl">Current Status</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,.03)", border: "0.5px solid rgba(255,255,255,.08)", borderRadius: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: profileForm.isAvailable ? "#10B981" : "#6B7280", animation: profileForm.isAvailable ? "avPulse 2s infinite" : "none" }} />
                      <span style={{ fontSize: 14, color: "white", flex: 1 }}>{profileForm.isAvailable ? "Available for bookings" : "Busy / Not accepting bookings"}</span>
                      <button onClick={toggleAvailability}
                        style={{ padding: "6px 14px", borderRadius: 8, border: `0.5px solid ${profileForm.isAvailable ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}`, background: profileForm.isAvailable ? "rgba(239,68,68,.07)" : "rgba(16,185,129,.07)", color: profileForm.isAvailable ? "#F87171" : "#34D399", fontSize: 12.5, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {profileForm.isAvailable ? "Go Busy" : "Go Available"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button className="save-btn" onClick={saveProfile} disabled={editLoading}>
                {editLoading ? <><div className="spin-sm" />Saving…</> : "✓ Save Changes"}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}