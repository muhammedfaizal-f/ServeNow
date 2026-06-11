import React from 'react'
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { providerAPI } from "../api/services";
import './ExploreProviders.css'
import api from "../api/axios";


const CATEGORIES = [
  "All", "Plumbing", "Electrician", "Home Cleaning", "Painting",
  "AC Repair", "Carpentry", "Tutoring", "Pet Care", "Gardening",
  "Moving Help", "Locksmith", "Home Cook",
];

const SORT_OPTIONS = [
  { value: "rating", label: "⭐ Top Rated" },
  { value: "priceLow", label: "💰 Price: Low → High" },
  { value: "priceHigh", label: "💸 Price: High → Low" },
  { value: "jobs", label: "🏆 Most Experienced" },
  { value: "newest", label: "🆕 Newest" },
];

// colour palette — index 0-11 maps to each category
const COLOR_PALETTE = [
  { color: "#4A90E2", bg: "#1e3a5f" },
  { color: "#F59E0B", bg: "#3d2a00" },
  { color: "#10B981", bg: "#0a3325" },
  { color: "#EC4899", bg: "#3b0a26" },
  { color: "#06B6D4", bg: "#062a35" },
  { color: "#F97316", bg: "#3d1a00" },
  { color: "#A78BFA", bg: "#2a1a4a" },
  { color: "#FB7185", bg: "#3b0a17" },
  { color: "#4ADE80", bg: "#0a2e12" },
  { color: "#FCD34D", bg: "#332800" },
  { color: "#94A3B8", bg: "#1e2533" },
  { color: "#FF6B35", bg: "#3d1500" },
];

const CAT_COLORS = {};
CATEGORIES.slice(1).forEach((c, i) => {
  CAT_COLORS[c] = COLOR_PALETTE[i % COLOR_PALETTE.length];
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — normalise backend provider → card-friendly shape
// ─────────────────────────────────────────────────────────────────────────────
const normalise = (p) => {
  const palette = CAT_COLORS[p.category] || { color: "#FF6B35", bg: "#1e0a00" };
  const userName = p.user?.name || "Provider";

  return {
    _id: p._id,
    // name comes from the linked User document
    name: userName,
    role: `${p.category} Expert`,
    location: p.location?.city
      ? `${p.location.address || ""}, ${p.location.city}`.replace(/^,\s*/, "")
      : "Coimbatore",
    rating: p.averageRating ?? 0,
    reviews: p.totalReviews ?? 0,
    jobs: p.totalJobsDone ? `${p.totalJobsDone}+` : "0",
    price: p.hourlyRate ?? 0,
    badge: p.badge || "Verified",
    badgeColor: p.isVerified ? "#10B981" : "#94A3B8",
    available: p.isAvailable ?? false,
    skills: p.skills || [],
    category: p.category || "",
    response: p.responseTime || "~15 mins",
    // avatar initials from user name
    avatar: userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    color: palette.color,
    bg: palette.bg,
    // keep full raw data so BookNow can use it
    _raw: p,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// STARS
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ r, c }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width="12" height="12"
        fill={i <= Math.floor(r) ? c : "none"}
        stroke={i <= Math.floor(r) ? c : "rgba(255,255,255,.2)"}
        strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ExploreProviders() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("rating");
  const [search, setSearch] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [avail, setAvail] = useState(false);
  const [showFilt, setShowFilt] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [booked, setBooked] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 8;

  // ── Fetch from real backend ───────────────────────────────────────────────
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params
      const params = {
        page,
        limit: LIMIT,
        sort,
      };
      if (category !== "All") params.category = category;
      if (minRate) params.minRate = minRate;
      if (maxRate) params.maxRate = maxRate;
      if (avail) params.isAvailable = true;
      if (search) params.search = search;

      console.log("Fetching providers with params:", params);

      const res = await api.get("/providers", { params });

      console.log("Providers response:", res.data);

      // normalise every provider into card-friendly shape
      const normalised = (res.data.providers || []).map(normalise);
      setProviders(normalised);
      setTotal(res.data.total || normalised.length);

    } catch (err) {
      console.error("fetchProviders error:", err?.response?.data || err.message);
      setError(
        err?.response?.data?.message ||
        "Failed to load providers. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, minRate, maxRate, avail, page]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  // ── Handle Book Now ───────────────────────────────────────────────────────
  // Pass full provider via navigate state so BookNow doesn't need another fetch
  const handleBook = (p) => {
    console.log("Provider object:", p);
    console.log("Provider _id:", p._id);

    navigate(`/book/${p._id}`, {
      state: { provider: p._raw || p }
    });
  };

  // ── Clear filters ─────────────────────────────────────────────────────────
  const clearFilters = () => {
    setMinRate(""); setMaxRate(""); setAvail(false); setSearch("");
    setCategory("All"); setPage(1);
  };

  return (
    <>
      <div className="ep">

        {/* ── Topbar ── */}
        <div className="ep-bar">
          <div className="ep-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
          <div className="ep-sw">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              className="ep-si"
              placeholder="Search providers, skills…"
              value={search}
              onChange={e => { setSearch(e.target.value); setCategory("All"); setPage(1); }}
              onKeyDown={e => e.key === "Enter" && fetchProviders()}
            />
          </div>
          <button className={`ep-fb ${showFilt ? "on" : ""}`} onClick={() => setShowFilt(f => !f)}>
            <svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            Filters {showFilt ? "▲" : "▼"}
          </button>
        </div>

        {/* ── Filter panel ── */}
        {showFilt && (
          <div className="ep-fp">
            <span className="fp-lbl">Price ₹/hr:</span>
            <div className="fp-range">
              <input className="fp-in" placeholder="Min" value={minRate} onChange={e => setMinRate(e.target.value)} type="number" />
              <span className="fp-sep">–</span>
              <input className="fp-in" placeholder="Max" value={maxRate} onChange={e => setMaxRate(e.target.value)} type="number" />
            </div>
            <span className="fp-lbl" style={{ marginLeft: 8 }}>Available now:</span>
            <div className="avail-tog" onClick={() => setAvail(a => !a)}>
              <div className="tog-tr" style={{ background: avail ? "#FF6B35" : "rgba(255,255,255,.1)" }}>
                <div className="tog-th" style={{ transform: avail ? "translateX(16px)" : "translateX(0)" }} />
              </div>
              {avail ? "Yes" : "No"}
            </div>
            <button
              onClick={clearFilters}
              style={{ marginLeft: "auto", padding: "6px 14px", border: "0.5px solid rgba(255,255,255,.1)", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Clear all
            </button>
          </div>
        )}

        <div className="ep-con">

          {/* categories */}
          <div className="ep-cats">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`ep-cat ${category === c ? "on" : ""}`}
                onClick={() => { setCategory(c); setSearch(""); setPage(1); }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* error banner */}
          {error && (
            <div className="ep-err">
              <span>⚠ {error}</span>
              <button onClick={fetchProviders}>Retry</button>
            </div>
          )}

          {/* toolbar */}
          <div className="ep-tb">
            <div className="ep-cnt">
              {loading
                ? "Loading providers…"
                : <><strong>{total}</strong> providers found</>
              }
            </div>
            <div className="ep-sort">
              <span className="sort-lbl">Sort:</span>
              <select className="sort-sel" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* skeletons */}
          {loading && (
            <div className="ep-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skel" />)}
            </div>
          )}

          {/* empty state */}
          {!loading && !error && providers.length === 0 && (
            <div className="ep-empty">
              <div className="ep-empty-ic">🔍</div>
              <div className="ep-empty-t">No providers found. Try adjusting filters.</div>
            </div>
          )}

          {/* provider cards */}
          {!loading && providers.length > 0 && (
            <div className="ep-grid">
              {providers.map(p => (
                <div
                  key={p._id}
                  className={`pc ${hovered === p._id ? "hov" : ""}`}
                  style={hovered === p._id ? { borderColor: `${p.color}28` } : {}}
                  onMouseEnter={() => setHovered(p._id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* banner */}
                  <div className="pc-ban" style={{ background: `linear-gradient(135deg,${p.bg},${p.color}18)` }}>
                    <div
                      className="pc-av-pill"
                      style={{
                        background: p.available ? "rgba(16,185,129,.15)" : "rgba(100,100,100,.15)",
                        color: p.available ? "#34D399" : "rgba(255,255,255,.35)",
                        border: `0.5px solid ${p.available ? "rgba(16,185,129,.25)" : "rgba(255,255,255,.08)"}`,
                      }}
                    >
                      <span className="av-dot" style={{ background: p.available ? "#10B981" : "#6B7280" }} />
                      {p.available ? "Available" : "Busy"}
                    </div>
                  </div>

                  <div className="pc-body">
                    {/* avatar + badge */}
                    <div className="pc-tr">
                      <div className="pc-av" style={{ background: p.bg, color: p.color }}>{p.avatar}</div>
                      <div
                        className="pc-badge"
                        style={{ background: `${p.badgeColor}18`, color: p.badgeColor, border: `0.5px solid ${p.badgeColor}30` }}
                      >
                        {p.badge}
                      </div>
                    </div>

                    {/* info */}
                    <div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-role">{p.role}</div>
                      <div className="pc-loc">
                        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {p.location}
                      </div>
                    </div>

                    {/* rating */}
                    <div className="pc-rat">
                      <Stars r={p.rating} c={p.color} />
                      <span className="pc-rn">{p.rating || "—"}</span>
                      <span style={{ color: "rgba(255,255,255,.15)" }}>·</span>
                      <span className="pc-rv">{p.reviews} reviews</span>
                    </div>

                    {/* skills */}
                    {p.skills.length > 0 && (
                      <div className="pc-skills">
                        {p.skills.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="pc-sk"
                            style={{ color: p.color, borderColor: `${p.color}28`, background: `${p.color}0e` }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* stats */}
                    <div className="pc-meta">
                      <div><div className="pm-v">{p.jobs}</div><div className="pm-l">Jobs</div></div>
                      <div className="pm-d" />
                      <div><div className="pm-v">₹{p.price}/hr</div><div className="pm-l">Starting</div></div>
                      <div className="pm-d" />
                      <div><div className="pm-v" style={{ color: p.color }}>{p.rating || "—"}★</div><div className="pm-l">Rating</div></div>
                    </div>

                    {/* response time */}
                    <div className="pc-resp">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      Response: {p.response}
                    </div>

                    {/* actions */}
                    <div className="pc-acts">
                      <button className="btn-msg" title="Chat">
                        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      </button>
                      <button
                        className={`btn-bk ${booked === p._id ? "ok" : ""}`}
                        style={booked !== p._id ? {
                          background: p.color,
                          color: "white",
                          boxShadow: hovered === p._id ? `0 4px 14px ${p.color}40` : "none",
                        } : {}}
                        onClick={() => handleBook(p)}
                      >
                        {booked === p._id
                          ? <><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Going…</>
                          : `Book · ₹${p.price}/hr`
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* pagination */}
          {total > LIMIT && !loading && (
            <div className="ep-pag">
              {page > 1 && (
                <button className="pag-btn" onClick={() => setPage(p => p - 1)}>← Prev</button>
              )}
              {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => (
                <button
                  key={i}
                  className={`pag-btn ${page === i + 1 ? "on" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              {page < Math.ceil(total / LIMIT) && (
                <button className="pag-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
