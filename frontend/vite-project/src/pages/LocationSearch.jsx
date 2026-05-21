import React from 'react'
import './LocationSearch.css'
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from 'react-router-dom';

  const CATEGORIES = [
  { v:"Plumbing",      ic:"🔧", c:"#4A90E2" },
  { v:"Electrician",   ic:"⚡", c:"#F59E0B" },
  { v:"Home Cleaning", ic:"🧹", c:"#10B981" },
  { v:"Painting",      ic:"🎨", c:"#EC4899" },
  { v:"AC Repair",     ic:"❄️", c:"#06B6D4" },
  { v:"Carpentry",     ic:"🛠", c:"#F97316" },
  { v:"Tutoring",      ic:"📚", c:"#A78BFA" },
  { v:"Pet Care",      ic:"🐾", c:"#FB7185" },
  { v:"Gardening",     ic:"🪴", c:"#4ADE80" },
  { v:"Moving Help",   ic:"📦", c:"#FCD34D" },
  { v:"Locksmith",     ic:"🔑", c:"#94A3B8" },
  { v:"Home Cook",     ic:"🍳", c:"#FF6B35" },
];
 
const CITIES = ["Coimbatore","Chennai","Madurai","Trichy","Salem","Erode","Tiruppur","Vellore"];
 
const MOCK_RESULTS = [
  { _id:"1", name:"Ravi Kumar",  role:"Master Plumber",        location:"Gandhipuram, Coimbatore", rating:4.9, reviews:312, price:299, badge:"Top Rated",    badgeColor:"#F59E0B", available:true,  avatar:"RK", color:"#4A90E2", bg:"#1e3a5f", category:"Plumbing",      distance:"1.2 km" },
  { _id:"2", name:"Suresh M.",   role:"Senior Electrician",    location:"RS Puram, Coimbatore",    rating:4.8, reviews:245, price:350, badge:"Pro Verified", badgeColor:"#10B981", available:true,  avatar:"SM", color:"#10B981", bg:"#0a2e18", category:"Electrician",   distance:"2.5 km" },
  { _id:"3", name:"Meena S.",    role:"Deep Cleaning Expert",  location:"Saibaba Colony, CBE",     rating:5.0, reviews:189, price:199, badge:"Perfect",      badgeColor:"#A78BFA", available:true,  avatar:"MS", color:"#A78BFA", bg:"#1e0f3d", category:"Home Cleaning", distance:"0.8 km" },
  { _id:"4", name:"Arjun D.",    role:"AC Technician",         location:"Peelamedu, Coimbatore",   rating:4.7, reviews:178, price:450, badge:"Fast",         badgeColor:"#06B6D4", available:false, avatar:"AD", color:"#06B6D4", bg:"#052030", category:"AC Repair",     distance:"3.1 km" },
  { _id:"5", name:"Priya R.",    role:"Home Tutor",            location:"Peelamedu, Coimbatore",   rating:4.9, reviews:401, price:250, badge:"Most Booked",  badgeColor:"#FF6B35", available:true,  avatar:"PR", color:"#FF6B35", bg:"#3d1500", category:"Tutoring",      distance:"1.9 km" },
  { _id:"6", name:"Karthik V.",  role:"Carpenter",             location:"Saravanampatti, CBE",     rating:4.6, reviews:134, price:380, badge:"Rising",       badgeColor:"#FB7185", available:true,  avatar:"KV", color:"#FB7185", bg:"#3b0a17", category:"Carpentry",     distance:"4.2 km" },
];
 
const RECENT_SEARCHES = ["Plumber near Gandhipuram","AC Repair Coimbatore","Deep Cleaning RS Puram"];
 
const Stars = ({ r, c }) => (
  <span style={{display:"inline-flex",gap:2}}>
    {[1,2,3,4,5].map(i=>(
      <svg key={i} viewBox="0 0 24 24" width="11" height="11"
        fill={i<=Math.floor(r)?c:"none"} stroke={i<=Math.floor(r)?c:"rgba(255,255,255,.2)"} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);
 
export default function LocationSearch() {
  const navigate                   = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
 
  // ── State ─────────────────────────────────────────────────────────────────
  const [query,    setQuery]    = useState(searchParams.get("q")        || "");
  const [city,     setCity]     = useState(searchParams.get("city")     || "Coimbatore");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [hovered,  setHovered]  = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
 
  // ── Auto-search if params in URL ──────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get("q") || searchParams.get("category")) {
      doSearch();
    }
  }, []);
 
  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      // REAL API — uncomment:
      // const res = await providerAPI.getAll({
      //   search:   query,
      //   city,
      //   category: category || "",
      // });
      // setResults(res.data.providers);
 
      // Update URL params
      const params = {};
      if (query)    params.q        = query;
      if (city)     params.city     = city;
      if (category) params.category = category;
      setSearchParams(params);
 
      // Mock fallback:
      await new Promise(r => setTimeout(r, 900));
      let data = [...MOCK_RESULTS];
      if (category) data = data.filter(p => p.category === category);
      if (query)    data = data.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.role.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(data);
    } catch (err) {
      console.error("search error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, city, category]);
 
  const handleKeyDown = (e) => { if (e.key === "Enter") doSearch(); };
 

  return (
    <>
    <div className="ls">
 
        {/* ── Hero search ── */}
        <div className="ls-hero">
          <div className="lh-blob lhb1"/><div className="lh-blob lhb2"/>
 
          <div className="ls-top">
            <button className="ls-back" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </button>
 
            <h1 className="ls-h">Find Services<br/><span>Near You</span></h1>
            <p className="ls-sh">Search from 500+ verified providers across your city. Filter by category, price & availability.</p>
 
            {/* search bar */}
            <div className="ls-scard">
              <div className="ls-field">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  placeholder="Search service, provider or skill…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="ls-sep"/>
              <div className="ls-city">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <select value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="ls-btn" onClick={doSearch}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                Search
              </button>
            </div>
 
            {/* category quick picks */}
            <div className="ls-cats">
              {CATEGORIES.map(c => (
                <button
                  key={c.v}
                  className={`ls-cat ${category===c.v?"on":""}`}
                  onClick={() => { setCategory(category===c.v?"":c.v); }}
                >
                  {c.ic} {c.v}
                </button>
              ))}
            </div>
 
            {/* recent searches */}
            {!searched && (
              <div className="ls-recent">
                <span className="ls-recent-lbl">🕐 Recent:</span>
                {RECENT_SEARCHES.map((s,i) => (
                  <span key={i} className="ls-recent-chip"
                    onClick={() => { setQuery(s); doSearch(); }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Results body ── */}
        <div className="ls-body">
 
          {/* map placeholder */}
          {searched && (
            <div className="ls-map">
              <div className="map-pins">
                <div className="map-dot" style={{background:"#FF6B35",top:"35%",left:"42%"}}/>
                <div className="map-dot" style={{background:"#4A90E2",top:"55%",left:"60%",animationDelay:".5s"}}/>
                <div className="map-dot" style={{background:"#10B981",top:"25%",left:"68%",animationDelay:"1s"}}/>
                <div className="map-dot" style={{background:"#F59E0B",top:"60%",left:"30%",animationDelay:"1.5s"}}/>
              </div>
              <span style={{fontSize:24,position:"relative",zIndex:1}}>🗺️</span>
              <span style={{position:"relative",zIndex:1}}>
                {results.length} providers found near <strong style={{color:"white"}}>{city}</strong>
                &nbsp;—&nbsp;<span style={{color:"#FF6B35",cursor:"pointer"}} onClick={()=>{}}>View on map →</span>
              </span>
            </div>
          )}
 
          {/* toolbar */}
          {searched && (
            <div className="ls-tb">
              <div className="ls-cnt">
                {loading ? "Searching…" : (
                  results.length === 0
                    ? "No providers found"
                    : <><strong>{results.length}</strong> providers in <strong>{city}</strong>{category && <> · <strong>{category}</strong></>}</>
                )}
              </div>
              <div className="ls-views">
                <button className={`view-btn ${viewMode==="grid"?"on":""}`} onClick={() => setViewMode("grid")} title="Grid view">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`view-btn ${viewMode==="list"?"on":""}`} onClick={() => setViewMode("list")} title="List view">
                  <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          )}
 
          {/* skeletons */}
          {loading && (
            viewMode === "grid"
              ? <div className="res-grid">{[1,2,3,4,5,6].map(i=><div key={i} className={`skel skel-g`}/>)}</div>
              : <div className="res-list">{[1,2,3,4].map(i=><div key={i} className={`skel skel-l`}/>)}</div>
          )}
 
          {/* initial (no search yet) */}
          {!searched && !loading && (
            <div className="ls-initial">
              <div className="ls-init-ic">🔍</div>
              <div className="ls-init-t">Search for a Service</div>
              <div className="ls-init-p">Type a service name, pick your city, or click a category above to find providers near you.</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginTop:8}}>
                {["🔧 Plumbing","⚡ Electrician","🧹 Cleaning","❄️ AC Repair"].map((t,i)=>(
                  <button key={i}
                    style={{padding:"9px 18px",borderRadius:999,border:"0.5px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"rgba(255,255,255,.55)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}
                    onClick={() => { setQuery(t.split(" ").slice(1).join(" ")); doSearch(); }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {/* no results */}
          {searched && !loading && results.length === 0 && (
            <div className="ls-initial">
              <div className="ls-init-ic">😔</div>
              <div className="ls-init-t">No Providers Found</div>
              <div className="ls-init-p">Try a different keyword, change the city, or browse all categories.</div>
              <button onClick={() => { setQuery(""); setCategory(""); doSearch(); }}
                style={{padding:"10px 22px",borderRadius:10,border:"none",background:"#FF6B35",color:"white",fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Clear & Browse All
              </button>
            </div>
          )}
 
          {/* grid results */}
          {!loading && results.length > 0 && viewMode === "grid" && (
            <div className="res-grid">
              {results.map(p => (
                <div key={p._id}
                  className={`rc ${hovered===p._id?"hov":""}`}
                  style={hovered===p._id?{borderColor:`${p.color}28`}:{}}
                  onMouseEnter={()=>setHovered(p._id)}
                  onMouseLeave={()=>setHovered(null)}
                >
                  <div className="rc-ban" style={{background:`linear-gradient(135deg,${p.bg},${p.color}18)`}}>
                    <div className="rc-avpill" style={{background:p.available?"rgba(16,185,129,.15)":"rgba(100,100,100,.15)",color:p.available?"#34D399":"rgba(255,255,255,.35)",border:`0.5px solid ${p.available?"rgba(16,185,129,.25)":"rgba(255,255,255,.08)"}`}}>
                      <span className="av-dot" style={{background:p.available?"#10B981":"#6B7280"}}/>
                      {p.available?"Available":"Busy"}
                    </div>
                  </div>
                  <div className="rc-body">
                    <div className="rc-tr">
                      <div className="rc-av" style={{background:p.bg,color:p.color}}>{p.avatar}</div>
                      <div className="rc-badge" style={{background:`${p.badgeColor}18`,color:p.badgeColor,border:`0.5px solid ${p.badgeColor}30`}}>{p.badge}</div>
                    </div>
                    <div>
                      <div className="rc-name">{p.name}</div>
                      <div className="rc-role">{p.role}</div>
                      <div className="rc-loc"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{p.location}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <div className="rc-rat">
                        <Stars r={p.rating} c={p.color}/>
                        <span className="rc-rn">{p.rating}</span>
                        <span style={{color:"rgba(255,255,255,.15)"}}>·</span>
                        <span className="rc-rv">{p.reviews} reviews</span>
                      </div>
                      <div className="rc-dist">📍 {p.distance}</div>
                    </div>
                    <div className="rc-footer">
                      <div className="rc-price">₹{p.price}/hr</div>
                      <button className="rc-book" style={{background:p.color,boxShadow:hovered===p._id?`0 4px 14px ${p.color}40`:"none"}}
                        onClick={() => navigate(`/book/${p._id}`)}>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {/* list results */}
          {!loading && results.length > 0 && viewMode === "list" && (
            <div className="res-list">
              {results.map(p => (
                <div key={p._id}
                  className={`lc ${hovered===p._id?"hov":""}`}
                  style={hovered===p._id?{borderColor:`${p.color}20`}:{}}
                  onMouseEnter={()=>setHovered(p._id)}
                  onMouseLeave={()=>setHovered(null)}
                >
                  <div className="lc-av" style={{background:p.bg,color:p.color}}>{p.avatar}</div>
                  <div className="lc-info">
                    <div className="lc-name">{p.name}</div>
                    <div className="lc-role">{p.role}</div>
                    <div className="lc-row">
                      <Stars r={p.rating} c={p.color}/>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{p.rating} · {p.reviews} reviews</span>
                      <span style={{fontSize:11.5,color:"rgba(255,255,255,.25)"}}>📍 {p.location}</span>
                      <span className="rc-dist">📍 {p.distance}</span>
                      <span style={{fontSize:11,padding:"3px 9px",borderRadius:999,background:`${p.badgeColor}18`,color:p.badgeColor,border:`0.5px solid ${p.badgeColor}28`}}>{p.badge}</span>
                    </div>
                  </div>
                  <div className="lc-right">
                    <div className="lc-price">₹{p.price}/hr</div>
                    <button className="lc-book" style={{background:p.color}}
                      onClick={() => navigate(`/book/${p._id}`)}>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
 
        </div>
      </div>
    </>
  )
}

