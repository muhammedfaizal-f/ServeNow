import React from 'react'
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './ExploreProviders.css'



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
const MOCK = [
  { _id: "1", name: "Ravi Kumar", role: "Master Plumber", location: "Gandhipuram, CBE", rating: 4.9, reviews: 312, jobs: "800+", price: 299, badge: "Top Rated", badgeColor: "#F59E0B", available: true, avatar: "RK", color: "#4A90E2", bg: "#1e3a5f", skills: ["Pipe Repair", "Leak Fix", "Tap Install"], category: "Plumbing", response: "~10 mins" },
  { _id: "2", name: "Suresh M.", role: "Senior Electrician", location: "RS Puram, CBE", rating: 4.8, reviews: 245, jobs: "600+", price: 350, badge: "Pro Verified", badgeColor: "#10B981", available: true, avatar: "SM", color: "#10B981", bg: "#0a2e18", skills: ["Wiring", "Fan Fitting", "Inverter"], category: "Electrician", response: "~15 mins" },
  { _id: "3", name: "Meena S.", role: "Deep Cleaning Expert", location: "Saibaba Colony, CBE", rating: 5.0, reviews: 189, jobs: "420+", price: 199, badge: "Perfect Score", badgeColor: "#A78BFA", available: true, avatar: "MS", color: "#A78BFA", bg: "#1e0f3d", skills: ["Deep Clean", "Kitchen", "Bathroom"], category: "Home Cleaning", response: "~5 mins" },
  { _id: "4", name: "Arjun D.", role: "AC & Appliance Tech", location: "Peelamedu, CBE", rating: 4.7, reviews: 178, jobs: "390+", price: 450, badge: "Fast Response", badgeColor: "#06B6D4", available: false, avatar: "AD", color: "#06B6D4", bg: "#052030", skills: ["AC Service", "Gas Refill", "Deep Clean"], category: "AC Repair", response: "~20 mins" },
  { _id: "5", name: "Priya R.", role: "Home Tutor", location: "Peelamedu, CBE", rating: 4.9, reviews: 401, jobs: "1.2K+", price: 250, badge: "Most Booked", badgeColor: "#FF6B35", available: true, avatar: "PR", color: "#FF6B35", bg: "#3d1500", skills: ["Maths", "Science", "English"], category: "Tutoring", response: "~8 mins" },
  { _id: "6", name: "Karthik V.", role: "Carpenter & Fabricator", location: "Saravanampatti, CBE", rating: 4.6, reviews: 134, jobs: "280+", price: 380, badge: "New & Rising", badgeColor: "#FB7185", available: true, avatar: "KV", color: "#FB7185", bg: "#3b0a17", skills: ["Furniture Fix", "Shelf", "Modular"], category: "Carpentry", response: "~25 mins" },
  { _id: "7", name: "Lakshmi P.", role: "Home Cook", location: "Singanallur, CBE", rating: 4.8, reviews: 220, jobs: "500+", price: 200, badge: "Top Rated", badgeColor: "#F59E0B", available: true, avatar: "LP", color: "#FF6B35", bg: "#3d1500", skills: ["South Indian", "Tiffin", "Party Cook"], category: "Home Cook", response: "~12 mins" },
  { _id: "8", name: "Murugan K.", role: "Painter & Decorator", location: "Ukkadam, CBE", rating: 4.5, reviews: 98, jobs: "210+", price: 320, badge: "Verified", badgeColor: "#10B981", available: false, avatar: "MK", color: "#EC4899", bg: "#3b0a26", skills: ["Interior", "Exterior", "Waterproofing"], category: "Painting", response: "~30 mins" },
];

const Stars = ({ r, c }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width="12" height="12"
        fill={i <= Math.floor(r) ? c : "none"} stroke={i <= Math.floor(r) ? c : "rgba(255,255,255,.2)"} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </span>
);

export default function ExploreProviders() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // ── Fetch providers ───────────────────────────────────────────────────────
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      // REAL API — uncomment when backend is running:
      // const res = await providerAPI.getAll({
      //   category: category === "All" ? "" : category,
      //   sort, page, limit: LIMIT,
      //   minRate, maxRate,
      //   isAvailable: avail || "",
      //   search,
      // });
      // setProviders(res.data.providers);
      // setTotal(res.data.total);

      // MOCK data fallback:
      await new Promise(r => setTimeout(r, 600));
      let data = [...MOCK];
      if (category !== "All") data = data.filter(p => p.category === category);
      if (avail) data = data.filter(p => p.available);
      if (minRate) data = data.filter(p => p.price >= Number(minRate));
      if (maxRate) data = data.filter(p => p.price <= Number(maxRate));
      if (search) data = data.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      );
      if (sort === "rating") data.sort((a, b) => b.rating - a.rating);
      if (sort === "priceLow") data.sort((a, b) => a.price - b.price);
      if (sort === "priceHigh") data.sort((a, b) => b.price - a.price);
      setProviders(data);
      setTotal(data.length);
    } catch (err) {
      console.error("fetchProviders error:", err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, minRate, maxRate, avail, page]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleBook = (p) => {
    setBooked(p._id);
    setTimeout(() => {
      navigate(`/book/${p._id}`);
    }, 600);
  };


  return (
    <>
      <div className="ep">

        {/* ── Topbar ── */}
        <div className="ep-bar">
          <div className="ep-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
          <div className="ep-sw">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input className="ep-si" placeholder="Search providers, skills…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
            <button onClick={() => { setMinRate(""); setMaxRate(""); setAvail(false); setSearch(""); }}
              style={{ marginLeft: "auto", padding: "6px 14px", border: "0.5px solid rgba(255,255,255,.1)", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Clear filters
            </button>
          </div>
        )}

        <div className="ep-con">

          {/* categories */}
          <div className="ep-cats">
            {CATEGORIES.map(c => (
              <button key={c} className={`ep-cat ${category === c ? "on" : ""}`}
                onClick={() => { setCategory(c); setPage(1); }}>{c}</button>
            ))}
          </div>

          {/* toolbar */}
          <div className="ep-tb">
            <div className="ep-cnt">
              {loading ? "Searching…" : <><strong>{total}</strong> providers found</>}
            </div>
            <div className="ep-sort">
              <span className="sort-lbl">Sort:</span>
              <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* grid */}
          {loading ? (
            <div className="ep-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skel" />)}
            </div>
          ) : providers.length === 0 ? (
            <div className="ep-empty">
              <div className="ep-empty-ic">🔍</div>
              <div className="ep-empty-t">No providers found. Try adjusting filters.</div>
            </div>
          ) : (
            <div className="ep-grid">
              {providers.map(p => (
                <div key={p._id}
                  className={`pc ${hovered === p._id ? "hov" : ""}`}
                  style={hovered === p._id ? { borderColor: `${p.color}28` } : {}}
                  onMouseEnter={() => setHovered(p._id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* banner */}
                  <div className="pc-ban" style={{ background: `linear-gradient(135deg,${p.bg},${p.color}18)` }}>
                    <div className="pc-av-pill" style={{
                      background: p.available ? "rgba(16,185,129,.15)" : "rgba(100,100,100,.15)",
                      color: p.available ? "#34D399" : "rgba(255,255,255,.35)",
                      border: `0.5px solid ${p.available ? "rgba(16,185,129,.25)" : "rgba(255,255,255,.08)"}`
                    }}>
                      <span className="av-dot" style={{ background: p.available ? "#10B981" : "#6B7280" }} />
                      {p.available ? "Available" : "Busy"}
                    </div>
                  </div>

                  <div className="pc-body">
                    <div className="pc-tr">
                      <div className="pc-av" style={{ background: p.bg, color: p.color }}>{p.avatar}</div>
                      <div className="pc-badge" style={{ background: `${p.badgeColor}18`, color: p.badgeColor, border: `0.5px solid ${p.badgeColor}30` }}>{p.badge}</div>
                    </div>
                    <div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-role">{p.role}</div>
                      <div className="pc-loc"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>{p.location}</div>
                    </div>
                    <div className="pc-rat">
                      <Stars r={p.rating} c={p.color} />
                      <span className="pc-rn">{p.rating}</span>
                      <span style={{ color: "rgba(255,255,255,.15)" }}>·</span>
                      <span className="pc-rv">{p.reviews} reviews</span>
                    </div>
                    <div className="pc-skills">
                      {p.skills.map((s, i) => (
                        <span key={i} className="pc-sk" style={{ color: p.color, borderColor: `${p.color}28`, background: `${p.color}0e` }}>{s}</span>
                      ))}
                    </div>
                    <div className="pc-meta">
                      <div><div className="pm-v">{p.jobs}</div><div className="pm-l">Jobs</div></div>
                      <div className="pm-d" />
                      <div><div className="pm-v">₹{p.price}/hr</div><div className="pm-l">Starting</div></div>
                      <div className="pm-d" />
                      <div><div className="pm-v" style={{ color: p.color }}>{p.rating}★</div><div className="pm-l">Rating</div></div>
                    </div>
                    <div className="pc-resp">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      Response: {p.response}
                    </div>
                    <div className="pc-acts">
                      <button className="btn-msg" title="Chat">
                        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      </button>
                      <button
                        className={`btn-bk ${booked === p._id ? "ok" : ""}`}
                        style={booked !== p._id ? { background: p.color, color: "white", boxShadow: hovered === p._id ? `0 4px 14px ${p.color}40` : "none" } : {}}
                        onClick={() => handleBook(p)}
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

          {/* pagination */}
          {total > LIMIT && (
            <div className="ep-pag">
              {page > 1 && <button className="pag-btn" onClick={() => setPage(p => p - 1)}>← Prev</button>}
              {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => (
                <button key={i} className={`pag-btn ${page === i + 1 ? "on" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              {page < Math.ceil(total / LIMIT) && <button className="pag-btn" onClick={() => setPage(p => p + 1)}>Next →</button>}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
