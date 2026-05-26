import React from 'react'
import './LocationSearch.css'
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CATEGORIES = [
  { v: "Plumbing", ic: "🔧", c: "#4A90E2", bg: "#1e3a5f" },
  { v: "Electrician", ic: "⚡", c: "#F59E0B", bg: "#3d2a00" },
  { v: "Home Cleaning", ic: "🧹", c: "#10B981", bg: "#0a3325" },
  { v: "Painting", ic: "🎨", c: "#EC4899", bg: "#3b0a26" },
  { v: "AC Repair", ic: "❄️", c: "#06B6D4", bg: "#062a35" },
  { v: "Carpentry", ic: "🛠", c: "#F97316", bg: "#3d1a00" },
  { v: "Tutoring", ic: "📚", c: "#A78BFA", bg: "#2a1a4a" },
  { v: "Pet Care", ic: "🐾", c: "#FB7185", bg: "#3b0a17" },
  { v: "Gardening", ic: "🪴", c: "#4ADE80", bg: "#0a2e12" },
  { v: "Moving Help", ic: "📦", c: "#FCD34D", bg: "#332800" },
  { v: "Locksmith", ic: "🔑", c: "#94A3B8", bg: "#1e2533" },
  { v: "Home Cook", ic: "🍳", c: "#FF6B35", bg: "#3d1500" },
];

const CITIES = ["Coimbatore", "Chennai", "Madurai", "Trichy", "Salem", "Erode", "Tiruppur", "Vellore"];

const MOCK = [
  { _id: "1", name: "Ravi Kumar", role: "Master Plumber", loc: "Gandhipuram, CBE", rating: 4.9, reviews: 312, price: 299, badge: "Top Rated", bc: "#F59E0B", avail: true, av: "RK", c: "#4A90E2", bg: "#1e3a5f", cat: "Plumbing", dist: "1.2 km", jobs: "800+", resp: "~10 mins", skills: ["Pipe Repair", "Leak Fix", "Tap Install"] },
  { _id: "2", name: "Suresh M.", role: "Senior Electrician", loc: "RS Puram, CBE", rating: 4.8, reviews: 245, price: 350, badge: "Pro Verified", bc: "#10B981", avail: true, av: "SM", c: "#10B981", bg: "#0a2e18", cat: "Electrician", dist: "2.5 km", jobs: "600+", resp: "~15 mins", skills: ["Wiring", "Fan Fitting", "Inverter"] },
  { _id: "3", name: "Meena S.", role: "Deep Cleaning Expert", loc: "Saibaba Colony, CBE", rating: 5.0, reviews: 189, price: 199, badge: "Perfect", bc: "#A78BFA", avail: true, av: "MS", c: "#A78BFA", bg: "#1e0f3d", cat: "Home Cleaning", dist: "0.8 km", jobs: "420+", resp: "~5 mins", skills: ["Deep Clean", "Kitchen", "Bathroom"] },
  { _id: "4", name: "Arjun D.", role: "AC & Appliance Tech", loc: "Peelamedu, CBE", rating: 4.7, reviews: 178, price: 450, badge: "Fast", bc: "#06B6D4", avail: false, av: "AD", c: "#06B6D4", bg: "#052030", cat: "AC Repair", dist: "3.1 km", jobs: "390+", resp: "~20 mins", skills: ["AC Service", "Gas Refill", "Deep Clean"] },
  { _id: "5", name: "Priya R.", role: "Home Tutor", loc: "Peelamedu, CBE", rating: 4.9, reviews: 401, price: 250, badge: "Most Booked", bc: "#FF6B35", avail: true, av: "PR", c: "#FF6B35", bg: "#3d1500", cat: "Tutoring", dist: "1.9 km", jobs: "1.2K+", resp: "~8 mins", skills: ["Maths", "Science", "English"] },
  { _id: "6", name: "Karthik V.", role: "Carpenter & Fabricator", loc: "Saravanampatti, CBE", rating: 4.6, reviews: 134, price: 380, badge: "Rising", bc: "#FB7185", avail: true, av: "KV", c: "#FB7185", bg: "#3b0a17", cat: "Carpentry", dist: "4.2 km", jobs: "280+", resp: "~25 mins", skills: ["Furniture Fix", "Shelf", "Modular"] },
  { _id: "7", name: "Lakshmi P.", role: "Home Cook", loc: "Singanallur, CBE", rating: 4.8, reviews: 220, price: 200, badge: "Top Rated", bc: "#F59E0B", avail: true, av: "LP", c: "#FF6B35", bg: "#3d1500", cat: "Home Cook", dist: "2.8 km", jobs: "500+", resp: "~12 mins", skills: ["South Indian", "Tiffin", "Party Cook"] },
  { _id: "8", name: "Murugan K.", role: "Painter & Decorator", loc: "Ukkadam, CBE", rating: 4.5, reviews: 98, price: 320, badge: "Verified", bc: "#10B981", avail: false, av: "MK", c: "#EC4899", bg: "#3b0a26", cat: "Painting", dist: "5.0 km", jobs: "210+", resp: "~30 mins", skills: ["Interior", "Exterior", "Waterproofing"] },
];

const Stars = ({ r, c }) => (
  <span style={{ display: "inline-flex", gap: 1.5 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width="11" height="11"
        fill={i <= Math.floor(r) ? c : "none"} stroke={i <= Math.floor(r) ? c : "rgba(255,255,255,.2)"} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

export default function LocationSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "Coimbatore");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [booked, setBooked] = useState(null);
  const [sort, setSort] = useState("rating");
  const [avail, setAvail] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (city) params.city = city;
      if (category) params.category = category;
      setSearchParams(params, { replace: true });

      await new Promise(r => setTimeout(r, 700));

      let data = [...MOCK];
      if (category) {
        data = data.filter(
          p => p.cat.toLowerCase() === category.toLowerCase()
        );
      }
      if (avail) data = data.filter(p => p.avail);
      if (query) {
        const q = query.trim().toLowerCase();

        data = data.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          p.skills.some(s => s.toLowerCase().includes(q))
        );
      }
      if (sort === "rating") data.sort((a, b) => b.rating - a.rating);
      if (sort === "priceLow") data.sort((a, b) => a.price - b.price);
      if (sort === "dist") data.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, [query, city, category, sort, avail]);

  useEffect(() => {
    if (searchParams.get("q") || searchParams.get("category")) {
      doSearch();
    }
  }, []);

  const handleBook = (id) => {
    setBooked(id);
    setTimeout(() => navigate(`/book/${id}`), 700);
  };

  const clearAll = () => {
    setQuery(""); setCategory(""); setAvail(false);
    setSearched(false); setResults([]);
  };

  return (
    <>
      <div className="ls-root">

        {/* ══ STICKY NAV ══ */}
        <nav className="ls-nav">
          <div className="ls-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>

          <div className="nav-divider" />

          <button className="nav-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>

          {/* inline search bar */}
          <div className="nav-search">
            <div className="ns-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </div>
            <input
              className="ns-input"
              placeholder="Search service, provider or skill…"
              value={query}
              onChange={e => {
                setQuery(e.target.value);

                // remove selected category when typing manually
                setCategory("");
              }}
              onKeyDown={e => e.key === "Enter" && doSearch()}
            />
            <div className="ns-sep" />
            <div className="ns-city">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <select value={city} onChange={e => setCity(e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button className="nav-search-btn" onClick={doSearch}>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              Search
            </button>
          </div>

          {/* right controls */}
          <div className="nav-right">
            <div className="nav-avail" onClick={() => setAvail(a => !a)}>
              <div className="tog" style={{ background: avail ? "#FF6B35" : "rgba(255,255,255,.1)" }}>
                <div className="tog-th" style={{ transform: avail ? "translateX(16px)" : "none" }} />
              </div>
              Available now
            </div>
            <select
              className="nav-sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="rating">⭐ Top Rated</option>
              <option value="priceLow">💰 Price Low</option>
              <option value="dist">📍 Nearest</option>
            </select>
          </div>
        </nav>

        {/* ══ CATEGORY BAR ══ */}
        <div className="cat-bar">
          {CATEGORIES.map(c => (
            <button
              key={c.v}
              className={`cat-chip ${category === c.v ? "on" : ""}`}
              onClick={() => {
                const next = category === c.v ? "" : c.v;

                setCategory(next);

                // update search input also
                setQuery(next);

                // auto search
                setTimeout(() => {
                  doSearch();
                }, 0);
              }}
            >
              {c.ic} {c.v}
            </button>
          ))}
        </div>

        {/* ══ BODY ══ */}
        <div className="ls-body">

          {/* ── INITIAL STATE (no search yet) ── */}
          {!searched && !loading && (
            <div className="ls-initial">
              <div className="init-rings">
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
                <span className="ring-icon">🔍</span>
              </div>

              <h2 className="init-title">Find Services Near You</h2>
              <p className="init-sub">
                Search from 500+ verified providers in {city}. Type a service, pick a category, or use a quick search below.
              </p>

              <div className="quick-btns">
                {[
                  { ic: "🔧", t: "Plumbing" },
                  { ic: "⚡", t: "Electrician" },
                  { ic: "🧹", t: "Cleaning" },
                  { ic: "❄️", t: "AC Repair" },
                  { ic: "📚", t: "Tutoring" },
                  { ic: "🍳", t: "Home Cook" },
                ].map((b, i) => (
                  <button key={i} className="quick-btn"
                    onClick={() => {
                      setCategory(
                        CATEGORIES.find(
                          c => c.v.toLowerCase().includes(b.t.toLowerCase())
                        )?.v || ""
                      ); setQuery(b.t); doSearch();
                    }}>
                    {b.ic} {b.t}
                  </button>
                ))}
              </div>

              <div className="recent-row">
                <span className="recent-lbl">🕐 Recent:</span>
                {["Plumber near Gandhipuram", "AC Repair Coimbatore", "Deep Cleaning RS Puram"].map((s, i) => (
                  <span key={i} className="recent-chip"
                    onClick={() => { setQuery(s); doSearch(); }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS / LOADING ── */}
          {(searched || loading) && (
            <div className="ls-results">

              {/* toolbar */}
              {!loading && (
                <div className="res-tb">
                  <div className="res-cnt">
                    {results.length === 0
                      ? "No providers found"
                      : <><strong>{results.length}</strong> providers found<span className="city-tag">📍 {city}</span>{category && <span className="city-tag" style={{ marginLeft: 4 }}>{category}</span>}</>
                    }
                  </div>
                  <div className="res-actions">
                    <button className="clear-btn" onClick={clearAll}>✕ Clear</button>
                  </div>
                </div>
              )}

              {/* skeletons */}
              {loading && (
                <div className="res-grid">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skel" />)}
                </div>
              )}

              {/* no results */}
              {!loading && results.length === 0 && (
                <div className="no-results">
                  <div className="no-results-ic">😔</div>
                  <div className="no-results-t">No Providers Found</div>
                  <div className="no-results-p">Try a different keyword, change the city, or browse all categories above.</div>
                  <button className="no-results-btn" onClick={clearAll}>Browse All Providers</button>
                </div>
              )}

              {/* cards */}
              {!loading && results.length > 0 && (
                <div className="res-grid">
                  {results.map(p => (
                    <div
                      key={p._id}
                      className={`pcard ${hovered === p._id ? "hov" : ""}`}
                      style={hovered === p._id ? { borderColor: `${p.c}28` } : {}}
                      onMouseEnter={() => setHovered(p._id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* banner */}
                      <div className="pc-banner">
                        <div
                          className="pc-banner-bg"
                          style={{
                            background: `linear-gradient(135deg, ${p.bg} 0%, ${p.c}22 100%)`,
                            opacity: hovered === p._id ? 1 : 0.8,
                          }}
                        />
                        {/* distance */}
                        <div className="pc-dist">📍 {p.dist}</div>
                        {/* availability */}
                        <div
                          className="pc-avpill"
                          style={{
                            background: p.avail ? "rgba(16,185,129,.18)" : "rgba(100,100,100,.18)",
                            color: p.avail ? "#34D399" : "rgba(255,255,255,.38)",
                            border: `0.5px solid ${p.avail ? "rgba(16,185,129,.3)" : "rgba(255,255,255,.1)"}`,
                          }}
                        >
                          <span className="av-dot" style={{ background: p.avail ? "#10B981" : "#6B7280" }} />
                          {p.avail ? "Available" : "Busy"}
                        </div>
                      </div>

                      <div className="pc-body">
                        {/* avatar + badge */}
                        <div className="pc-top">
                          <div className="pc-avatar" style={{ background: p.bg, color: p.c }}>{p.av}</div>
                          <div className="pc-badge" style={{ background: `${p.bc}18`, color: p.bc, border: `0.5px solid ${p.bc}30` }}>{p.badge}</div>
                        </div>

                        {/* info */}
                        <div>
                          <div className="pc-name">{p.name}</div>
                          <div className="pc-role">{p.role}</div>
                          <div className="pc-loc">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {p.loc}
                          </div>
                        </div>

                        {/* rating */}
                        <div className="pc-rat">
                          <Stars r={p.rating} c={p.c} />
                          <span className="pc-rn">{p.rating}</span>
                          <span style={{ color: "rgba(255,255,255,.14)" }}>·</span>
                          <span className="pc-rv">{p.reviews} reviews</span>
                        </div>

                        {/* skills */}
                        <div className="pc-skills">
                          {p.skills.map((s, i) => (
                            <span key={i} className="pc-sk" style={{ color: p.c, borderColor: `${p.c}25`, background: `${p.c}0d` }}>{s}</span>
                          ))}
                        </div>

                        {/* stats */}
                        <div className="pc-stats">
                          <div className="pc-stat"><div className="pc-sv">{p.jobs}</div><div className="pc-sl">Jobs</div></div>
                          <div className="pc-sdiv" />
                          <div className="pc-stat"><div className="pc-sv">₹{p.price}/hr</div><div className="pc-sl">Starting</div></div>
                          <div className="pc-sdiv" />
                          <div className="pc-stat"><div className="pc-sv" style={{ color: p.c }}>{p.rating}★</div><div className="pc-sl">Rating</div></div>
                        </div>

                        {/* response time */}
                        <div className="pc-resp">
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          Avg response: {p.resp}
                        </div>

                        {/* actions */}
                        <div className="pc-acts">
                          <button className="btn-msg" title="Chat">
                            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                          </button>
                          <button
                            className={`btn-book ${booked === p._id ? "sent" : ""}`}
                            style={booked !== p._id ? {
                              background: p.c,
                              boxShadow: hovered === p._id ? `0 4px 14px ${p.c}45` : "none",
                            } : {}}
                            onClick={() => handleBook(p._id)}
                          >
                            {booked === p._id
                              ? <><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Redirecting…</>
                              : `Book · ₹${p.price}/hr`
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

