import React from 'react'
import "./Userprofile.css"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI, bookingAPI } from "../api/services";







const MOCK_BOOKINGS = [
    { _id: "b1", service: { title: "Pipe Repair", category: "Plumbing" }, provider: { name: "Ravi Kumar", avatar: "RK", color: "#4A90E2" }, bookingDate: "2025-08-10", timeSlot: { start: "10:00 AM" }, status: "completed", totalAmount: 299, paymentMethod: "cash" },
    { _id: "b2", service: { title: "Fan Fitting", category: "Electrician" }, provider: { name: "Suresh M.", avatar: "SM", color: "#10B981" }, bookingDate: "2025-08-18", timeSlot: { start: "02:00 PM" }, status: "confirmed", totalAmount: 150, paymentMethod: "online" },
    { _id: "b3", service: { title: "Deep Cleaning", category: "Home Cleaning" }, provider: { name: "Meena S.", avatar: "MS", color: "#A78BFA" }, bookingDate: "2025-08-20", timeSlot: { start: "09:00 AM" }, status: "pending", totalAmount: 999, paymentMethod: "cash" },
    { _id: "b4", service: { title: "AC Service", category: "AC Repair" }, provider: { name: "Arjun D.", avatar: "AD", color: "#06B6D4" }, bookingDate: "2025-07-28", timeSlot: { start: "03:00 PM" }, status: "completed", totalAmount: 499, paymentMethod: "online" },
    { _id: "b5", service: { title: "Maths Tutoring", category: "Tutoring" }, provider: { name: "Priya R.", avatar: "PR", color: "#FF6B35" }, bookingDate: "2025-07-15", timeSlot: { start: "05:00 PM" }, status: "cancelled", totalAmount: 250, paymentMethod: "cash" },
    { _id: "b6", service: { title: "Tap Install", category: "Plumbing" }, provider: { name: "Ravi Kumar", avatar: "RK", color: "#4A90E2" }, bookingDate: "2025-06-30", timeSlot: { start: "11:00 AM" }, status: "completed", totalAmount: 199, paymentMethod: "cash" },
];

const STATUS_CONFIG = {
    completed: { label: "Completed", color: "#10B981", bg: "rgba(16,185,129,.12)", icon: "✓" },
    confirmed: { label: "Confirmed", color: "#4A90E2", bg: "rgba(74,144,226,.12)", icon: "📅" },
    pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,.12)", icon: "⏳" },
    cancelled: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,.12)", icon: "✕" },
    "in-progress": { label: "In Progress", color: "#A78BFA", bg: "rgba(167,139,250,.12)", icon: "🔧" },
};

const TABS = ["Overview", "Bookings", "Transactions", "Settings"];

export default function UserProfile() {
    const navigate = useNavigate();
    // const { user, logout, updateUser } = useAuth();   // real auth

    const { user, logout } = useAuth();
   useEffect(() => {
  if (user?.role === "provider") {
    navigate("/provider-profile");
  } else if (user?.role === "admin") {
    navigate("/admin-profile");
  }
}, [user, navigate]);
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);
    const [activeTab, setActiveTab] = useState("Overview");
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [filterStat, setFilterStat] = useState("all");
    const [hovered, setHovered] = useState(null);
    const [imgError, setImgError] = useState(false);



    const [form, setForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        pincode: user?.address?.pincode || "",
    });

    // ── Computed stats ──────────────────────────────────────────────────────────
    const totalSpent = bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.totalAmount, 0);
    const completedCnt = bookings.filter(b => b.status === "completed").length;
    const pendingCnt = bookings.filter(b => ["pending", "confirmed"].includes(b.status)).length;
    const memberSince = new Date(user?.createdAt || Date.now());
    const now = new Date();
    const monthsUsing = Math.max(1, Math.floor((now - memberSince) / (1000 * 60 * 60 * 24 * 30)));
    const yearsUsing = Math.floor(monthsUsing / 12);
    const memberLabel = yearsUsing >= 1 ? `${yearsUsing} yr${yearsUsing > 1 ? "s" : ""}` : `${monthsUsing} mo`;

    // ── Filter bookings ─────────────────────────────────────────────────────────
    const filtered = filterStat === "all"
        ? bookings
        : bookings.filter(b => b.status === filterStat);

    const saveProfile = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setUser(u => ({
            ...u,
            name: form.name,
            phone: form.phone,
            address: { ...u.address, street: form.street, city: form.city, pincode: form.pincode },
        }));
        setEditMode(false);
        setLoading(false);
    };

    // ── Avatar initials ─────────────────────────────────────────────────────────
    const initials = user?.name?.split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

    return (
        <>
            <div className="up-root">

                {/* ── NAV ── */}
                <nav className="up-nav">
                    <div className="up-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
                    <div className="nav-div" />
                    <button className="up-back" onClick={() => navigate("/")}>
                        <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Home
                    </button>
                    <span className="up-nav-title" style={{ color: "rgba(255,255,255,.3)" }}>/ My Profile</span>
                    <div className="up-nav-right">
                        <button
                            className="up-logout"
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <div className="up-hero">
                    <div className="hero-blob hb1" /><div className="hero-blob hb2" />
                    <div className="hero-inner">
                        {/* avatar */}
                        <div className="avatar-wrap">
                            <div className="avatar-ring">
                                <div className="avatar-inner">
                                    {user?.avatar && !imgError
                                        ? <img src={user?.avatar} alt={user?.name} className="avatar-img" onError={() => setImgError(true)} />
                                        : <span className="avatar-initials">{initials}</span>
                                    }
                                </div>
                            </div>
                            <div className="avatar-online" title="Online" />
                            <div className="avatar-edit-btn" title="Change photo">✏️</div>
                        </div>

                        {/* info */}
                        <div className="hero-info">
                            <h1 className="hero-name">{user?.name || "User"}</h1>
                            <p className="hero-email">📧 {user?.email || "No Email"} &nbsp;·&nbsp; 📱 {user?.phone}</p>
                            <div className="hero-tags">
                                <span className="hero-tag" style={{ background: "rgba(16,185,129,.12)", color: "#34D399", border: "0.5px solid rgba(16,185,129,.25)" }}>
                                    ✓ Verified Account
                                </span>
                                <span className="hero-tag" style={{ background: "rgba(255,107,53,.1)", color: "#FF8C5A", border: "0.5px solid rgba(255,107,53,.25)" }}>
                                    🏠 {user?.address?.city || "No City"}
                                </span>
                                <span className="hero-tag" style={{ background: "rgba(74,144,226,.1)", color: "#60A5FA", border: "0.5px solid rgba(74,144,226,.25)" }}>
                                    🗓 Member since {memberSince.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* stats row */}
                    <div className="hero-stats" style={{ maxWidth: 1100, margin: "28px auto 0", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                        {[
                            { ic: "📦", val: bookings.length, lbl: "Total Bookings" },
                            { ic: "✅", val: completedCnt, lbl: "Completed" },
                            { ic: "⏳", val: pendingCnt, lbl: "Upcoming" },
                            { ic: "💰", val: `₹${totalSpent.toLocaleString()}`, lbl: "Total Spent" },
                            { ic: "⏱", val: memberLabel, lbl: "Member For" },
                        ].map((s, i, a) => (
                            <div key={i} style={{ display: "flex", flex: 1 }}>
                                <div className="hs-item">
                                    <div className="hs-icon">{s.ic}</div>
                                    <div className="hs-val">{s.val}</div>
                                    <div className="hs-lbl">{s.lbl}</div>
                                </div>
                                {i < a.length - 1 && <div className="hs-div" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── TABS ── */}
                <div className="up-tabs" style={{ background: "#0B1437", borderBottom: "0.5px solid rgba(255,255,255,.07)" }}>
                    {TABS.map(t => (
                        <button key={t} className={`up-tab ${activeTab === t ? "on" : ""}`} onClick={() => setActiveTab(t)}>
                            {t}
                            {t === "Bookings" && pendingCnt > 0 && <span className="up-tab-badge">{pendingCnt}</span>}
                        </button>
                    ))}
                </div>

                {/* ── CONTENT ── */}
                <div className="up-content">

                    {/* ════ OVERVIEW ════ */}
                    {activeTab === "Overview" && (
                        <div className="ov-grid">
                            <div>
                                {/* stat cards */}
                                <div className="stat-cards" style={{ marginBottom: 18 }}>
                                    {[
                                        { ic: "📦", bg: "rgba(74,144,226,.12)", c: "#4A90E2", val: bookings.length, lbl: "Total Orders", trend: "+2 this month", tc: "rgba(16,185,129,.8)", tBg: "rgba(16,185,129,.1)" },
                                        { ic: "💰", bg: "rgba(255,107,53,.12)", c: "#FF6B35", val: `₹${totalSpent.toLocaleString()}`, lbl: "Total Spent", trend: "Lifetime spend", tc: "rgba(255,255,255,.35)", tBg: "rgba(255,255,255,.06)" },
                                        { ic: "✅", bg: "rgba(16,185,129,.12)", c: "#10B981", val: completedCnt, lbl: "Completed Jobs", trend: `${Math.round(completedCnt / bookings.length * 100 || 0)}% success`, tc: "rgba(16,185,129,.8)", tBg: "rgba(16,185,129,.1)" },
                                        { ic: "⏱", bg: "rgba(167,139,250,.12)", c: "#A78BFA", val: memberLabel, lbl: "Member Since", trend: `Since ${memberSince.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`, tc: "rgba(255,255,255,.35)", tBg: "rgba(255,255,255,.06)" },
                                    ].map((s, i) => (
                                        <div className="stat-card" key={i}>
                                            <div className="sc-top">
                                                <div className="sc-icon" style={{ background: s.bg }}>{s.ic}</div>
                                                <span className="sc-trend" style={{ background: s.tBg, color: s.tc, border: `0.5px solid ${s.tc}30` }}>{s.trend}</span>
                                            </div>
                                            <div>
                                                <div className="sc-val">{s.val}</div>
                                                <div className="sc-lbl">{s.lbl}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* recent bookings */}
                                <div className="ov-recent">
                                    <div className="ov-recent-h">
                                        Recent Bookings
                                        <span className="see-all" onClick={() => setActiveTab("Bookings")}>See all →</span>
                                    </div>
                                    {bookings.slice(0, 3).map(b => {
                                        const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                                        return (
                                            <div key={b._id} className="bk-card">
                                                <div className="bk-pav" style={{ background: `${b.provider.color}18`, color: b.provider.color }}>{b.provider.avatar}</div>
                                                <div className="bk-info">
                                                    <div className="bk-name">{b.service.title}</div>
                                                    <div className="bk-sub">{b.provider.name} · {b.service.category}</div>
                                                    <div className="bk-meta">
                                                        <span className="bk-tag"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>{new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                                        <span className="bk-tag"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>{b.timeSlot.start}</span>
                                                    </div>
                                                </div>
                                                <div className="bk-right">
                                                    <div className="bk-amt">₹{b.totalAmount}</div>
                                                    <div className="bk-status" style={{ background: sc.bg, color: sc.color, border: `0.5px solid ${sc.color}30` }}>{sc.icon} {sc.label}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* how to use */}
                                <div className="how-card">
                                    <div className="how-h">🚀 How to Use ServeNow</div>
                                    <div className="how-steps">
                                        {[
                                            { n: 1, c: "#FF6B35", bg: "rgba(255,107,53,.15)", t: "Browse Services", s: "Go to Explore Providers or search by location to find verified professionals near you." },
                                            { n: 2, c: "#4A90E2", bg: "rgba(74,144,226,.15)", t: "Book a Service", s: "Click 'Book Now', choose a time slot, enter your address, and confirm." },
                                            { n: 3, c: "#10B981", bg: "rgba(16,185,129,.15)", t: "Track your Order", s: "Monitor booking status in the Bookings tab — pending → confirmed → in-progress → done." },
                                            { n: 4, c: "#A78BFA", bg: "rgba(167,139,250,.15)", t: "Rate & Review", s: "Once complete, leave a review to help other customers find great providers." },
                                        ].map(s => (
                                            <div className="how-step" key={s.n}>
                                                <div className="how-num" style={{ background: s.bg, color: s.c }}>{s.n}</div>
                                                <div className="how-text">
                                                    <div className="ht">{s.t}</div>
                                                    <div className="hs">{s.s}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* right col */}
                            <div>
                                <div className="act-card">
                                    <div className="act-h">💳 Recent Activity</div>
                                    {bookings.filter(b => b.status === "completed").slice(0, 5).map(b => (
                                        <div className="act-row" key={b._id}>
                                            <div className="act-dot" style={{ background: b.provider.color }} />
                                            <div className="act-info">
                                                <div className="act-title">{b.service.title}</div>
                                                <div className="act-time">{new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                                            </div>
                                            <div className="act-amt">-₹{b.totalAmount}</div>
                                        </div>
                                    ))}
                                    {bookings.filter(b => b.status === "completed").length === 0 && (
                                        <div className="up-empty">No completed bookings yet</div>
                                    )}
                                </div>

                                {/* address card */}
                                <div className="act-card" style={{ marginTop: 14 }}>
                                    <div className="act-h">📍 Saved Address</div>
                                    <div style={{ background: "rgba(255,255,255,.04)", border: "0.5px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "white" }}>{user?.address?.street || "No Address"}</div>
                                        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>{user?.address?.city || "No City"}, {user?.address?.state || "No State"}</div>
                                        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>PIN: PIN: {user?.address?.pincode || "000000"}</div>
                                    </div>
                                    <button onClick={() => setActiveTab("Settings")}
                                        style={{ marginTop: 8, padding: "8px 14px", borderRadius: 9, border: "0.5px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: "100%", transition: "all .2s" }}
                                        onMouseEnter={e => e.target.style.color = "white"}
                                        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.5)"}>
                                        Edit Address →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ BOOKINGS ════ */}
                    {activeTab === "Bookings" && (
                        <>
                            <div className="bk-filters">
                                {[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
                                    <button key={v} className={`bk-filter ${filterStat === v ? "on" : ""}`} onClick={() => setFilterStat(v)}>{l}</button>
                                ))}
                            </div>
                            {filtered.length === 0 ? (
                                <div className="up-empty">No {filterStat === "all" ? "" : filterStat} bookings found.</div>
                            ) : (
                                <div className="bk-list">
                                    {filtered.map(b => {
                                        const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                                        return (
                                            <div key={b._id} className="bk-card">
                                                <div className="bk-pav" style={{ background: `${b.provider.color}18`, color: b.provider.color }}>{b.provider.avatar}</div>
                                                <div className="bk-info">
                                                    <div className="bk-name">{b.service.title}</div>
                                                    <div className="bk-sub">{b.provider.name} · {b.service.category}</div>
                                                    <div className="bk-meta">
                                                        <span className="bk-tag"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>{new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                        <span className="bk-tag"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>{b.timeSlot.start}</span>
                                                        <span className="bk-tag">💳 {b.paymentMethod === "cash" ? "Cash" : "Online"}</span>
                                                    </div>
                                                </div>
                                                <div className="bk-right">
                                                    <div className="bk-amt">₹{b.totalAmount}</div>
                                                    <div className="bk-status" style={{ background: sc.bg, color: sc.color, border: `0.5px solid ${sc.color}30` }}>{sc.icon} {sc.label}</div>
                                                    {b.status === "completed" && !b.isReviewed && (
                                                        <button className="bk-action">Rate ⭐</button>
                                                    )}
                                                    {["pending", "confirmed"].includes(b.status) && (
                                                        <button className="bk-action">Cancel</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ════ TRANSACTIONS ════ */}
                    {activeTab === "Transactions" && (
                        <>
                            <div className="tx-summary">
                                {[
                                    { ic: "💰", val: `₹${totalSpent.toLocaleString()}`, lbl: "Total Spent" },
                                    { ic: "✅", val: bookings.filter(b => b.paymentStatus === "paid" || b.status === "completed").length, lbl: "Paid Transactions" },
                                    { ic: "💳", val: bookings.filter(b => b.paymentMethod === "online").length, lbl: "Online Payments" },
                                ].map((s, i) => (
                                    <div className="tx-sum-card" key={i}>
                                        <div className="tx-si">{s.ic}</div>
                                        <div className="tx-sv">{s.val}</div>
                                        <div className="tx-sl">{s.lbl}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="tx-list">
                                {bookings.map(b => {
                                    const sc = STATUS_CONFIG[b.status];
                                    const paid = b.status === "completed" || b.paymentStatus === "paid";
                                    return (
                                        <div className="tx-row" key={b._id}>
                                            <div className="tx-icon" style={{ background: `${b.provider.color}18` }}>{b.provider.avatar}</div>
                                            <div className="tx-info">
                                                <div className="tx-title">{b.service.title}</div>
                                                <div className="tx-sub">{b.provider.name} · {b.service.category}</div>
                                            </div>
                                            <div className="tx-right">
                                                <div className="tx-amt" style={{ color: paid ? "#FF8C5A" : "rgba(255,255,255,.35)" }}>
                                                    {b.status === "cancelled" ? <span style={{ color: "rgba(239,68,68,.7)" }}>Cancelled</span> : `-₹${b.totalAmount}`}
                                                </div>
                                                <div className="tx-date">{new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                                                <span className="tx-method" style={{ background: b.paymentMethod === "online" ? "rgba(74,144,226,.12)" : "rgba(255,255,255,.06)", color: b.paymentMethod === "online" ? "#60A5FA" : "rgba(255,255,255,.45)" }}>
                                                    {b.paymentMethod === "online" ? "📱 Online" : "💵 Cash"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ════ SETTINGS ════ */}
                    {activeTab === "Settings" && (
                        <>
                            <div className="set-grid">
                                {/* personal info */}
                                <div className="set-card">
                                    <div className="set-h">👤 Personal Information</div>
                                    <div className="set-field"><label className="set-lbl">Full Name</label>
                                        <input className="set-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editMode} />
                                    </div>
                                    <div className="set-field"><label className="set-lbl">Email Address</label>
                                        <input className="set-input" value={user?.email} disabled placeholder="Cannot change email" />
                                    </div>
                                    <div className="set-field"><label className="set-lbl">Phone Number</label>
                                        <input className="set-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editMode} />
                                    </div>
                                    {!editMode
                                        ? <button className="set-save" onClick={() => setEditMode(true)} style={{ background: "rgba(255,255,255,.06)", border: "0.5px solid rgba(255,255,255,.1)" }}>✏️ Edit Profile</button>
                                        : <button className="set-save" onClick={saveProfile} disabled={loading}>
                                            {loading ? <><div className="spin" />Saving…</> : <>✓ Save Changes</>}
                                        </button>
                                    }
                                </div>

                                {/* address */}
                                <div className="set-card">
                                    <div className="set-h">📍 Address</div>
                                    <div className="set-field"><label className="set-lbl">Street Address</label>
                                        <input className="set-input" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} disabled={!editMode} />
                                    </div>
                                    <div className="set-frow">
                                        <div className="set-field"><label className="set-lbl">City</label>
                                            <input className="set-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} disabled={!editMode} />
                                        </div>
                                        <div className="set-field"><label className="set-lbl">Pincode</label>
                                            <input className="set-input" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} disabled={!editMode} />
                                        </div>
                                    </div>
                                    <div className="set-field" style={{ marginBottom: 0 }}><label className="set-lbl">Member Since</label>
                                        <input className="set-input" value={memberSince.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} disabled />
                                    </div>
                                </div>
                            </div>

                            {/* danger zone */}
                            <div className="set-danger">
                                <div className="set-danger-info">
                                    <div className="dt">Deactivate Account</div>
                                    <div className="ds">Your data will be preserved. You can reactivate anytime by contacting support.</div>
                                </div>
                                <button className="set-danger-btn">Deactivate Account</button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    )
}
