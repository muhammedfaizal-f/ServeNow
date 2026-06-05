// src/pages/AdminProfile.jsx
import { useAuth } from '../context/AuthContext';
import { userAPI, providerAPI, bookingAPI, serviceAPI } from '../api/services';
import './AdminProfile.css';
// ── Full Admin Dashboard — connected to real backend ──────────────────────
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "providers", label: "Providers", icon: "🔧" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
];

const STATUS_COLORS = {
    pending: { color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
    confirmed: { color: "#4A90E2", bg: "rgba(74,144,226,.12)" },
    "in-progress": { color: "#A78BFA", bg: "rgba(167,139,250,.12)" },
    completed: { color: "#10B981", bg: "rgba(16,185,129,.12)" },
    cancelled: { color: "#EF4444", bg: "rgba(239,68,68,.12)" },
    rejected: { color: "#6B7280", bg: "rgba(107,114,128,.12)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
    <span style={{
        fontSize: 10.5, padding: "3px 9px", borderRadius: 999,
        background: bg, color: color,
        border: `0.5px solid ${color}30`,
        fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
        whiteSpace: "nowrap",
    }}>{label}</span>
);

const ActionBtn = ({ label, color, bg, borderColor, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: "6px 12px", borderRadius: 8,
            border: `0.5px solid ${borderColor || "rgba(255,255,255,.12)"}`,
            background: bg || "rgba(255,255,255,.04)",
            color: color || "rgba(255,255,255,.6)",
            fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all .2s", opacity: disabled ? .5 : 1,
        }}
    >{label}</button>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminProfile() {
    const navigate = useNavigate();

    // ── Tab & UI state ────────────────────────────────────────────────────────
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { msg, type }
    const { logout } = useAuth();
    // ── Overview stats ────────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    // ── Users tab ─────────────────────────────────────────────────────────────
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userPage, setUserPage] = useState(1);
    const [userTotal, setUserTotal] = useState(0);

    // ── Providers tab ─────────────────────────────────────────────────────────
    const [providers, setProviders] = useState([]);
    const [provFilter, setProvFilter] = useState("all"); // all | unverified | suspended
    const [provPage, setProvPage] = useState(1);
    const [provTotal, setProvTotal] = useState(0);

    // ── Bookings tab ──────────────────────────────────────────────────────────
    const [bookings, setBookings] = useState([]);
    const [bkStatus, setBkStatus] = useState("");
    const [bkPage, setBkPage] = useState(1);
    const [bkTotal, setBkTotal] = useState(0);

    // ── Reviews tab ───────────────────────────────────────────────────────────
    const [flaggedReviews, setFlaggedReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);

    const LIMIT = 10;

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // DATA FETCHERS
    // ─────────────────────────────────────────────────────────────────────────

    // Overview
    const fetchOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/dashboard");
            setStats(res.data.stats);
            setMonthlyData(res.data.monthlyBookings || []);
            setTopCategories(res.data.topCategories || []);
            setRecentBookings(res.data.recentBookings || []);
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to load dashboard", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    // Users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/users", {
                params: { search: userSearch, role: userRole, page: userPage, limit: LIMIT },
            });
            setUsers(res.data.users || []);
            setUserTotal(res.data.total || 0);
        } catch (err) {
            showToast("Failed to load users", "error");
        } finally { setLoading(false); }
    }, [userSearch, userRole, userPage]);

    // Providers
    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: provPage, limit: LIMIT };
            if (provFilter === "unverified") params.isVerified = false;
            if (provFilter === "suspended") params.isActive = false;
            const res = await api.get("/admin/providers", { params });
            setProviders(res.data.providers || []);
            setProvTotal(res.data.total || 0);
        } catch (err) {
            showToast("Failed to load providers", "error");
        } finally { setLoading(false); }
    }, [provFilter, provPage]);

    // Bookings
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: bkPage, limit: LIMIT };
            if (bkStatus) params.status = bkStatus;
            const res = await api.get("/admin/bookings", { params });
            setBookings(res.data.bookings || []);
            setBkTotal(res.data.total || 0);
        } catch (err) {
            showToast("Failed to load bookings", "error");
        } finally { setLoading(false); }
    }, [bkStatus, bkPage]);

    // Flagged reviews
    const fetchFlagged = useCallback(async () => {
        setReviewLoading(true);
        try {
            const res = await api.get("/admin/reviews/flagged");
            setFlaggedReviews(res.data.reviews || []);
        } catch (err) {
            showToast("Failed to load flagged reviews", "error");
        } finally { setReviewLoading(false); }
    }, []);

    // ── Load data when tab changes ────────────────────────────────────────────
    useEffect(() => {
        if (tab === "overview") fetchOverview();
        if (tab === "users") fetchUsers();
        if (tab === "providers") fetchProviders();
        if (tab === "bookings") fetchBookings();
        if (tab === "reviews") fetchFlagged();
    }, [tab, fetchOverview, fetchUsers, fetchProviders, fetchBookings, fetchFlagged]);

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const toggleUserStatus = async (userId) => {
        try {
            const res = await api.patch(`/admin/users/${userId}/toggle-status`);
            showToast(res.data.message);
            fetchUsers();
        } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
    };

    const verifyProvider = async (providerId) => {
        try {
            const res = await api.patch(`/admin/providers/${providerId}/verify`);
            showToast(res.data.message);
            fetchProviders();
        } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
    };

    const toggleProviderStatus = async (providerId) => {
        try {
            const res = await api.patch(`/admin/providers/${providerId}/toggle-status`);
            showToast(res.data.message);
            fetchProviders();
        } catch (err) { showToast(err?.response?.data?.message || "Error", "error"); }
    };

    const hideReview = async (reviewId) => {
        try {
            await api.patch(`/admin/reviews/${reviewId}/hide`);
            showToast("Review hidden from public view.");
            fetchFlagged();
        } catch (err) { showToast("Error", "error"); }
    };

    const dismissFlag = async (reviewId) => {
        try {
            await api.patch(`/admin/reviews/${reviewId}/dismiss-flag`);
            showToast("Flag dismissed.");
            fetchFlagged();
        } catch (err) { showToast("Error", "error"); }
    };

    return (
        <>
            <div className="ad">

                {/* ── Toast ── */}
                {toast && (
                    <div className={`toast ${toast.type}`}>
                        {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
                    </div>
                )}

                {/* ── Nav ── */}
                <nav className="ad-nav">
                    <div className="ad-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
                    <span className="ad-nav-badge">🛡 Admin Panel</span>
                    <div className="ad-nav-right">
                        <div className="ad-nav-user">
                            <div className="ad-nav-av">AD</div>
                            <span>Admin</span>
                        </div>
                        <button
                            className="ad-logout"
                            onClick={logout}
                        >
                            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                            Sign Out
                        </button>
                    </div>
                </nav>

                {/* ── Tabs ── */}
                <div className="ad-tabs">
                    {TABS.map(t => (
                        <button key={t.id} className={`ad-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Body ── */}
                <div className="ad-body">

                    {/* ════════════════════════════════
              OVERVIEW TAB
          ════════════════════════════════ */}
                    {tab === "overview" && (
                        <>
                            {loading && !stats ? (
                                <div className="ad-loading"><div className="ad-spin" /><p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Loading dashboard…</p></div>
                            ) : stats ? (
                                <>
                                    {/* stat cards */}
                                    <div className="stat-grid">
                                        {[
                                            { ic: "👤", v: stats.totalUsers, l: "Total Users", bg: "rgba(74,144,226,.12)", c: "#4A90E2" },
                                            { ic: "🔧", v: stats.totalProviders, l: "Total Providers", bg: "rgba(255,107,53,.12)", c: "#FF6B35" },
                                            { ic: "📅", v: stats.totalBookings, l: "Total Bookings", bg: "rgba(16,185,129,.12)", c: "#10B981" },
                                            { ic: "💰", v: `₹${(stats.totalRevenue || 0).toLocaleString()}`, l: "Total Revenue", bg: "rgba(245,158,11,.12)", c: "#F59E0B" },
                                        ].map((s, i) => (
                                            <div className="stat-card" key={i}>
                                                <div className="sc-top">
                                                    <div className="sc-ic" style={{ background: s.bg }}>{s.ic}</div>
                                                </div>
                                                <div className="sc-val">{s.v}</div>
                                                <div className="sc-lbl">{s.l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* booking status cards */}
                                    <div className="stat-grid" style={{ marginBottom: 24 }}>
                                        {[
                                            { ic: "⏳", v: stats.pendingBookings, l: "Pending", bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.2)", c: "#F59E0B" },
                                            { ic: "✅", v: stats.completedBookings, l: "Completed", bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.2)", c: "#10B981" },
                                            { ic: "✕", v: stats.cancelledBookings, l: "Cancelled", bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.2)", c: "#EF4444" },
                                            { ic: "⭐", v: stats.flaggedReviews, l: "Flagged Reviews", bg: "rgba(167,139,250,.08)", border: "rgba(167,139,250,.2)", c: "#A78BFA" },
                                        ].map((s, i) => (
                                            <div key={i} style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 14, padding: "16px 18px" }}>
                                                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.ic}</div>
                                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "white" }}>{s.v}</div>
                                                <div style={{ fontSize: 12.5, color: s.c, marginTop: 3 }}>{s.l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* alert cards */}
                                    <div className="alert-row">
                                        <div className="alert-card" style={{ background: "rgba(245,158,11,.07)", border: "0.5px solid rgba(245,158,11,.2)" }}>
                                            <div className="alert-ic">🆕</div>
                                            <div>
                                                <div className="alert-val">{stats.unverifiedProviders}</div>
                                                <div className="alert-lbl" style={{ color: "#F59E0B" }}>Providers awaiting verification</div>
                                            </div>
                                            <button className="alert-btn" style={{ background: "rgba(245,158,11,.12)", color: "#F59E0B", borderColor: "rgba(245,158,11,.3)" }} onClick={() => setTab("providers")}>
                                                Review →
                                            </button>
                                        </div>
                                        <div className="alert-card" style={{ background: "rgba(239,68,68,.07)", border: "0.5px solid rgba(239,68,68,.2)" }}>
                                            <div className="alert-ic">🚩</div>
                                            <div>
                                                <div className="alert-val">{stats.flaggedReviews}</div>
                                                <div className="alert-lbl" style={{ color: "#F87171" }}>Flagged reviews need moderation</div>
                                            </div>
                                            <button className="alert-btn" style={{ background: "rgba(239,68,68,.1)", color: "#F87171", borderColor: "rgba(239,68,68,.25)" }} onClick={() => setTab("reviews")}>
                                                Moderate →
                                            </button>
                                        </div>
                                    </div>

                                    {/* top categories bar chart */}
                                    {topCategories.length > 0 && (
                                        <div className="chart-card">
                                            <div className="chart-h">📊 Top Categories by Bookings</div>
                                            {(() => {
                                                const max = Math.max(...topCategories.map(c => c.count), 1);
                                                return topCategories.map((c, i) => (
                                                    <div className="bar-row" key={i}>
                                                        <div className="bar-lbl">{c._id}</div>
                                                        <div className="bar-track">
                                                            <div className="bar-fill" style={{ width: `${(c.count / max * 100)}%`, background: "#FF6B35" }} />
                                                        </div>
                                                        <div className="bar-val">{c.count}</div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    )}

                                    {/* recent bookings */}
                                    {recentBookings.length > 0 && (
                                        <div className="tbl-wrap">
                                            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,.06)" }}>
                                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "white" }}>Recent Bookings</div>
                                            </div>
                                            <table>
                                                <thead><tr>
                                                    <th>User</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th>
                                                </tr></thead>
                                                <tbody>
                                                    {recentBookings.map(b => {
                                                        const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                                                        return (
                                                            <tr key={b._id}>
                                                                <td><div style={{ fontWeight: 500, color: "white" }}>{b.user?.name || "—"}</div><div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)" }}>{b.user?.email}</div></td>
                                                                <td>{b.service?.title || "—"}</td>
                                                                <td style={{ color: "rgba(255,255,255,.5)", fontSize: 12.5 }}>{new Date(b.bookingDate || b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#FF8C5A" }}>₹{b.totalAmount}</td>
                                                                <td><Badge label={b.status} color={sc.color} bg={sc.bg} /></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </>
                    )}

                    {/* ════════════════════════════════
              USERS TAB
          ════════════════════════════════ */}
                    {tab === "users" && (
                        <>
                            <div className="sec-h">
                                All Users
                                <span className="sec-sub">Total: {userTotal}</span>
                            </div>
                            <div className="tbl-wrap">
                                <div className="tbl-toolbar">
                                    <div className="tbl-search">
                                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                        <input placeholder="Search by name, email, phone…" value={userSearch}
                                            onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                                            onKeyDown={e => e.key === "Enter" && fetchUsers()} />
                                    </div>
                                    <select className="tbl-sel" value={userRole} onChange={e => { setUserRole(e.target.value); setUserPage(1); }}>
                                        <option value="">All Roles</option>
                                        <option value="user">Users</option>
                                        <option value="provider">Providers</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                    <button onClick={fetchUsers}
                                        style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.6)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                                        Search
                                    </button>
                                </div>

                                {loading ? <div className="ad-loading"><div className="ad-spin" /></div> : (
                                    <table>
                                        <thead><tr>
                                            <th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {users.length === 0
                                                ? <tr><td colSpan={6}><div className="ad-empty">No users found.</div></td></tr>
                                                : users.map(u => (
                                                    <tr key={u._id}>
                                                        <td>
                                                            <div className="cell-av">
                                                                <div className="tbl-av" style={{ background: "rgba(74,144,226,.15)", color: "#4A90E2" }}>
                                                                    {u.name?.slice(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="tbl-name">{u.name}</div>
                                                                    <div className="tbl-sub">{u.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>{u.phone || "—"}</td>
                                                        <td>
                                                            <Badge
                                                                label={u.role}
                                                                color={u.role === "admin" ? "#F59E0B" : u.role === "provider" ? "#10B981" : "#4A90E2"}
                                                                bg={u.role === "admin" ? "rgba(245,158,11,.1)" : u.role === "provider" ? "rgba(16,185,129,.1)" : "rgba(74,144,226,.1)"}
                                                            />
                                                        </td>
                                                        <td style={{ color: "rgba(255,255,255,.4)", fontSize: 12.5 }}>
                                                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                label={u.isActive ? "Active" : "Inactive"}
                                                                color={u.isActive ? "#10B981" : "#EF4444"}
                                                                bg={u.isActive ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)"}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="cell-acts">
                                                                <ActionBtn
                                                                    label={u.isActive ? "Deactivate" : "Activate"}
                                                                    color={u.isActive ? "#F87171" : "#34D399"}
                                                                    bg={u.isActive ? "rgba(239,68,68,.08)" : "rgba(16,185,129,.08)"}
                                                                    borderColor={u.isActive ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}
                                                                    onClick={() => toggleUserStatus(u._id)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                )}

                                {/* pagination */}
                                {userTotal > LIMIT && (
                                    <div className="pag">
                                        <div className="pag-info">Showing {Math.min(LIMIT, users.length)} of {userTotal}</div>
                                        <div className="pag-btns">
                                            {userPage > 1 && <button className="pag-btn" onClick={() => setUserPage(p => p - 1)}>←</button>}
                                            {Array.from({ length: Math.ceil(userTotal / LIMIT) }, (_, i) => (
                                                <button key={i} className={`pag-btn ${userPage === i + 1 ? "on" : ""}`} onClick={() => setUserPage(i + 1)}>{i + 1}</button>
                                            ))}
                                            {userPage < Math.ceil(userTotal / LIMIT) && <button className="pag-btn" onClick={() => setUserPage(p => p + 1)}>→</button>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ════════════════════════════════
              PROVIDERS TAB
          ════════════════════════════════ */}
                    {tab === "providers" && (
                        <>
                            <div className="sec-h">
                                All Providers
                                <span className="sec-sub">Total: {provTotal}</span>
                            </div>

                            {/* filter chips */}
                            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                                {[["all", "All Providers"], ["unverified", "Pending Verification"], ["suspended", "Suspended"]].map(([v, l]) => (
                                    <button key={v}
                                        style={{ padding: "7px 16px", borderRadius: 999, border: "0.5px solid rgba(255,255,255,.1)", background: provFilter === v ? "#FF6B35" : "transparent", color: provFilter === v ? "white" : "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
                                        onClick={() => { setProvFilter(v); setProvPage(1); }}>
                                        {l}
                                    </button>
                                ))}
                            </div>

                            <div className="tbl-wrap">
                                {loading ? <div className="ad-loading"><div className="ad-spin" /></div> : (
                                    <table>
                                        <thead><tr>
                                            <th>Provider</th><th>Category</th><th>Rate</th><th>Rating</th><th>Verified</th><th>Status</th><th>Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {providers.length === 0
                                                ? <tr><td colSpan={7}><div className="ad-empty">No providers found.</div></td></tr>
                                                : providers.map(p => (
                                                    <tr key={p._id}>
                                                        <td>
                                                            <div className="cell-av">
                                                                <div className="tbl-av" style={{ background: "rgba(255,107,53,.15)", color: "#FF6B35" }}>
                                                                    {p.user?.name?.slice(0, 2).toUpperCase() || "??"}
                                                                </div>
                                                                <div>
                                                                    <div className="tbl-name">{p.user?.name || "—"}</div>
                                                                    <div className="tbl-sub">{p.user?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><Badge label={p.category} color="#A78BFA" bg="rgba(167,139,250,.1)" /></td>
                                                        <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#FF8C5A" }}>₹{p.hourlyRate}/hr</td>
                                                        <td style={{ color: "white", fontWeight: 500 }}>{p.averageRating || 0}★ <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)" }}>({p.totalReviews})</span></td>
                                                        <td>
                                                            <Badge
                                                                label={p.isVerified ? "Verified" : "Pending"}
                                                                color={p.isVerified ? "#10B981" : "#F59E0B"}
                                                                bg={p.isVerified ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)"}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                label={p.isActive ? "Active" : "Suspended"}
                                                                color={p.isActive ? "#10B981" : "#EF4444"}
                                                                bg={p.isActive ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)"}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="cell-acts">
                                                                {!p.isVerified && (
                                                                    <ActionBtn
                                                                        label="✓ Verify"
                                                                        color="#34D399"
                                                                        bg="rgba(16,185,129,.08)"
                                                                        borderColor="rgba(16,185,129,.25)"
                                                                        onClick={() => verifyProvider(p._id)}
                                                                    />
                                                                )}
                                                                <ActionBtn
                                                                    label={p.isActive ? "Suspend" : "Reactivate"}
                                                                    color={p.isActive ? "#F87171" : "#34D399"}
                                                                    bg={p.isActive ? "rgba(239,68,68,.08)" : "rgba(16,185,129,.08)"}
                                                                    borderColor={p.isActive ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}
                                                                    onClick={() => toggleProviderStatus(p._id)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                )}

                                {provTotal > LIMIT && (
                                    <div className="pag">
                                        <div className="pag-info">Showing {Math.min(LIMIT, providers.length)} of {provTotal}</div>
                                        <div className="pag-btns">
                                            {provPage > 1 && <button className="pag-btn" onClick={() => setProvPage(p => p - 1)}>←</button>}
                                            {Array.from({ length: Math.ceil(provTotal / LIMIT) }, (_, i) => (
                                                <button key={i} className={`pag-btn ${provPage === i + 1 ? "on" : ""}`} onClick={() => setProvPage(i + 1)}>{i + 1}</button>
                                            ))}
                                            {provPage < Math.ceil(provTotal / LIMIT) && <button className="pag-btn" onClick={() => setProvPage(p => p + 1)}>→</button>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ════════════════════════════════
              BOOKINGS TAB
          ════════════════════════════════ */}
                    {tab === "bookings" && (
                        <>
                            <div className="sec-h">
                                All Bookings
                                <span className="sec-sub">Total: {bkTotal}</span>
                            </div>

                            <div className="tbl-wrap">
                                <div className="tbl-toolbar">
                                    <select className="tbl-sel" value={bkStatus} onChange={e => { setBkStatus(e.target.value); setBkPage(1); }}>
                                        <option value="">All Statuses</option>
                                        {["pending", "confirmed", "in-progress", "completed", "cancelled", "rejected"].map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                {loading ? <div className="ad-loading"><div className="ad-spin" /></div> : (
                                    <table>
                                        <thead><tr>
                                            <th>User</th><th>Provider</th><th>Service</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th>
                                        </tr></thead>
                                        <tbody>
                                            {bookings.length === 0
                                                ? <tr><td colSpan={7}><div className="ad-empty">No bookings found.</div></td></tr>
                                                : bookings.map(b => {
                                                    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                                                    return (
                                                        <tr key={b._id}>
                                                            <td>
                                                                <div className="tbl-name">{b.user?.name || "—"}</div>
                                                                <div className="tbl-sub">{b.user?.phone}</div>
                                                            </td>
                                                            <td style={{ color: "rgba(255,255,255,.65)" }}>
                                                                {b.provider?.user?.name || b.provider?.name || "—"}
                                                            </td>
                                                            <td style={{ color: "rgba(255,255,255,.65)" }}>
                                                                {b.service?.title || "—"}
                                                                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)" }}>{b.service?.category}</div>
                                                            </td>
                                                            <td style={{ color: "rgba(255,255,255,.45)", fontSize: 12.5 }}>
                                                                {new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{b.timeSlot?.start}</div>
                                                            </td>
                                                            <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#FF8C5A" }}>₹{b.totalAmount}</td>
                                                            <td>
                                                                <Badge
                                                                    label={b.paymentMethod === "online" ? "Online" : "Cash"}
                                                                    color={b.paymentMethod === "online" ? "#4A90E2" : "rgba(255,255,255,.6)"}
                                                                    bg={b.paymentMethod === "online" ? "rgba(74,144,226,.1)" : "rgba(255,255,255,.06)"}
                                                                />
                                                            </td>
                                                            <td><Badge label={b.status} color={sc.color} bg={sc.bg} /></td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                                )}

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
                            </div>
                        </>
                    )}

                    {/* ════════════════════════════════
              REVIEWS TAB
          ════════════════════════════════ */}
                    {tab === "reviews" && (
                        <>
                            <div className="sec-h">
                                Flagged Reviews
                                <span className="sec-sub">{flaggedReviews.length} reviews need moderation</span>
                            </div>

                            {reviewLoading ? (
                                <div className="ad-loading"><div className="ad-spin" /></div>
                            ) : flaggedReviews.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                                    <div style={{ fontSize: 52 }}>✅</div>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>No flagged reviews</div>
                                    <div style={{ fontSize: 14, color: "rgba(255,255,255,.3)" }}>All reviews are clean. Nothing needs moderation.</div>
                                </div>
                            ) : (
                                flaggedReviews.map(r => (
                                    <div className="rev-card" key={r._id}>
                                        <div className="rev-top">
                                            <div className="tbl-av" style={{ background: "rgba(239,68,68,.12)", color: "#F87171", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                                {r.user?.name?.slice(0, 2).toUpperCase() || "?"}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, color: "white", fontSize: 14 }}>{r.user?.name || "Anonymous"}</div>
                                                <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                                                    {r.user?.email}
                                                    <span className="rev-flag">🚩 {r.flagReason || "Flagged"}</span>
                                                </div>
                                            </div>
                                            {/* star rating */}
                                            <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <svg key={i} viewBox="0 0 24 24" width="13" height="13"
                                                        fill={i <= r.rating ? "#F59E0B" : "none"}
                                                        stroke={i <= r.rating ? "#F59E0B" : "rgba(255,255,255,.2)"}
                                                        strokeWidth="1.5">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rev-body">"{r.comment}"</div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                            <div className="rev-meta">
                                                Provider: <strong style={{ color: "rgba(255,255,255,.6)" }}>{r.provider?.category || "—"}</strong>
                                                &nbsp;·&nbsp;
                                                {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <ActionBtn
                                                    label="🙈 Hide Review"
                                                    color="#F87171"
                                                    bg="rgba(239,68,68,.08)"
                                                    borderColor="rgba(239,68,68,.25)"
                                                    onClick={() => hideReview(r._id)}
                                                />
                                                <ActionBtn
                                                    label="✓ Dismiss Flag"
                                                    color="#34D399"
                                                    bg="rgba(16,185,129,.08)"
                                                    borderColor="rgba(16,185,129,.25)"
                                                    onClick={() => dismissFlag(r._id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                </div>
            </div>
        </>
    )
}