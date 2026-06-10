import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import "./ReviewPage.css"
// ─────────────────────────────────────────────────────────────────────────────
// STARS INTERACTIVE
// ─────────────────────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange, size = 32 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display:"inline-flex", gap:6 }}>
      {[1,2,3,4,5].map(i => {
        const filled = i <= (hovered || value);
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={size}
            height={size}
            style={{ cursor:"pointer", transition:"transform .15s", transform: filled?"scale(1.12)":"scale(1)" }}
            fill={filled ? "#F59E0B" : "none"}
            stroke={filled ? "#F59E0B" : "rgba(255,255,255,.25)"}
            strokeWidth="1.5"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
    </div>
  );
};
 
// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY STARS
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ r, c = "#F59E0B", size = 13 }) => (
  <span style={{ display:"inline-flex", gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width={size} height={size}
        fill={i<=Math.floor(r)?c:"none"}
        stroke={i<=Math.floor(r)?c:"rgba(255,255,255,.2)"}
        strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);
 
// ─────────────────────────────────────────────────────────────────────────────
// SUB RATING LABELS
// ─────────────────────────────────────────────────────────────────────────────
const SUB_LABELS = [
  { key:"punctuality",   label:"Punctuality",    icon:"⏰" },
  { key:"quality",       label:"Work Quality",   icon:"⭐" },
  { key:"communication", label:"Communication",  icon:"💬" },
  { key:"value",         label:"Value for Money",icon:"💰" },
];
 
const STAR_LABELS = ["","Terrible","Bad","Okay","Good","Excellent"];
 
// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const navigate                        = useNavigate();
  const [searchParams]                  = useSearchParams();
 
  // URL params: ?bookingId=xxx&providerId=xxx&mode=write|view
  const bookingIdParam  = searchParams.get("bookingId")  || "";
  const providerIdParam = searchParams.get("providerId") || "";
  const mode            = searchParams.get("mode")       || "write"; // "write" | "view"
 
  // ── State ─────────────────────────────────────────────────────────────────
  const [booking,      setBooking]      = useState(null);
  const [provider,     setProvider]     = useState(null);
  const [reviews,      setReviews]      = useState([]);
  const [ratingDist,   setRatingDist]   = useState({ 5:0, 4:0, 3:0, 2:0, 1:0 });
  const [myReviews,    setMyReviews]    = useState([]);
 
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState("");
 
  // ── Form state ────────────────────────────────────────────────────────────
  const [rating,       setRating]       = useState(0);
  const [comment,      setComment]      = useState("");
  const [subRatings,   setSubRatings]   = useState({ punctuality:0, quality:0, communication:0, value:0 });
 
  // ── Review list filters ───────────────────────────────────────────────────
  const [filterRating, setFilterRating] = useState(0);   // 0 = all
  const [sortBy,       setSortBy]       = useState("newest");
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [likedIds,     setLikedIds]     = useState(new Set());
 
  const LIMIT = 8;
 
  // ─────────────────────────────────────────────────────────────────────────
  // LOADERS
  // ─────────────────────────────────────────────────────────────────────────
 
  // Load booking + provider info (for write mode)
  const loadBooking = useCallback(async () => {
    if (!bookingIdParam) return;
    try {
      const res = await api.get(`/bookings/${bookingIdParam}`);
      const b   = res.data.booking;
      setBooking(b);
      setProvider(b.provider);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load booking details.");
    }
  }, [bookingIdParam]);
 
  // Load reviews for a provider (for view mode)
  const loadReviews = useCallback(async () => {
    const pid = providerIdParam || provider?._id;
    if (!pid) return;
    setLoading(true);
    try {
      const params = { sort: sortBy, page, limit: LIMIT };
      if (filterRating) params.rating = filterRating;
      const res = await api.get(`/reviews/provider/${pid}`, { params });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
      if (res.data.ratingDist) setRatingDist(res.data.ratingDist);
    } catch (err) {
      console.error("loadReviews error:", err);
    } finally {
      setLoading(false);
    }
  }, [providerIdParam, provider?._id, sortBy, page, filterRating]);
 
  // Load my own reviews
  const loadMyReviews = useCallback(async () => {
    try {
      const res = await api.get("/reviews/my");
      setMyReviews(res.data.reviews || []);
    } catch { /* silent */ }
  }, []);
 
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (mode === "write" && bookingIdParam) {
        await loadBooking();
      }
      if (mode === "view" && providerIdParam) {
        await loadReviews();
      }
      if (mode === "my") {
        await loadMyReviews();
      }
      setLoading(false);
    };
    init();
  }, [mode, bookingIdParam, providerIdParam]);
 
  useEffect(() => {
    if (mode === "view") loadReviews();
  }, [sortBy, page, filterRating, loadReviews]);
 
  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
 
  const submitReview = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    if (!comment.trim() || comment.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/reviews", {
        bookingId:  bookingIdParam,
        rating,
        comment:    comment.trim(),
        subRatings: Object.values(subRatings).some(v=>v>0) ? subRatings : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
 
  const toggleHelpful = async (reviewId) => {
    try {
      const res = await api.patch(`/reviews/${reviewId}/helpful`);
      setLikedIds(prev => {
        const next = new Set(prev);
        res.data.voted ? next.add(reviewId) : next.delete(reviewId);
        return next;
      });
      // update count in list
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, helpfulVotes: res.data.helpfulVotes } : r
      ));
    } catch { /* silent */ }
  };
 
  const flagReview = async (reviewId) => {
    try {
      await api.patch(`/reviews/${reviewId}/flag`, { reason: "Inappropriate content" });
      alert("Review flagged. Our team will review it.");
    } catch { /* silent */ }
  };
 
  const deleteMyReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setMyReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(err?.response?.data?.message || "Error deleting review.");
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────────────────
  const providerName = booking?.provider?.user?.name
    || provider?.user?.name
    || provider?.name
    || "Provider";
 
  const providerCategory = booking?.provider?.category
    || provider?.category
    || "Service";
 
  const totalDistCount = Object.values(ratingDist).reduce((s,v)=>s+v,0) || 1;
 
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)
    : "—";
 
  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (loading && mode !== "view") return (
    <div style={{ minHeight:"100vh",background:"#060D25",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14 }}>
      <div style={{ width:40,height:40,border:"3px solid rgba(255,107,53,.2)",borderTopColor:"#FF6B35",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
      <p style={{ color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:14 }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

   return (
    <>
    <div className="rv-root">
 
        {/* ── NAV ── */}
        <nav className="rv-nav">
          <div className="rv-logo" onClick={() => navigate("/")}>Serve<span>Now</span></div>
          <div className="rv-nav-div"/>
          <button className="rv-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          {/* nav mode switcher */}
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {[["write","✍ Write Review"],["view","👁 View Reviews"],["my","📋 My Reviews"]].map(([m,l]) => (
              <button key={m}
                onClick={() => navigate(`/reviews?mode=${m}${bookingIdParam?`&bookingId=${bookingIdParam}`:""}${providerIdParam?`&providerId=${providerIdParam}`:""}`)}
                style={{ padding:"7px 14px", borderRadius:999, border:"0.5px solid rgba(255,255,255,.1)", background: mode===m ? "#FF6B35" : "transparent", color: mode===m ? "white" : "rgba(255,255,255,.5)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
                {l}
              </button>
            ))}
          </div>
        </nav>
 
        {/* ════════════════════════════════════════════════════
            WRITE REVIEW MODE
        ════════════════════════════════════════════════════ */}
        {mode === "write" && (
          <div className="rv-write">
 
            {submitted ? (
              <div className="rv-success">
                <div className="rv-success-ic">⭐</div>
                <div className="rv-success-h">Review Submitted! 🎉</div>
                <div className="rv-success-p">
                  Thank you for your feedback! Your review helps other customers find great professionals.
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                  <button onClick={() => navigate("/")}
                    style={{ padding:"11px 22px", borderRadius:10, border:"0.5px solid rgba(255,255,255,.1)", background:"transparent", color:"rgba(255,255,255,.6)", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    ← Home
                  </button>
                  <button onClick={() => navigate(`/reviews?mode=view&providerId=${booking?.provider?._id || ""}`)}
                    style={{ padding:"11px 22px", borderRadius:10, border:"none", background:"#FF6B35", color:"white", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    View All Reviews
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,4vw,36px)", fontWeight:800, color:"white", letterSpacing:"-1px", marginBottom:6 }}>
                  Rate Your Experience
                </h1>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginBottom:28, lineHeight:1.6 }}>
                  Your honest feedback helps other customers and encourages great providers.
                </p>
 
                {/* provider info */}
                {(booking || providerName) && (
                  <div className="prov-mini">
                    <div className="prov-mini-av">
                      {providerName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="prov-mini-name">{providerName}</div>
                      <div className="prov-mini-role">{providerCategory}</div>
                      {booking && (
                       <div className="prov-mini-booking">
                          Booking on {new Date(booking.bookingDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {booking.timeSlot?.start}
                        </div>
                      )}
                    </div>
                    <span className="prov-mini-badge" style={{ marginLeft:"auto", alignSelf:"flex-start" }}>✓ Completed</span>
                  </div>
                )}
 
                {/* overall star rating */}
                <div className="star-section">
                  <div className="star-label">How would you rate the overall service?</div>
                  <StarPicker value={rating} onChange={setRating} size={40}/>
                  <div className="star-text">
                    {rating > 0 ? STAR_LABELS[rating] : "Tap to rate"}
                  </div>
                </div>
 
                {/* sub ratings */}
                <div className="rv-sec-h">Rate specific aspects <span style={{ fontSize:12, fontWeight:400, color:"rgba(255,255,255,.35)" }}>(optional)</span></div>
                <div className="sub-grid">
                  {SUB_LABELS.map(({ key, label, icon }) => (
                    <div className="sub-card" key={key}>
                      <div className="sub-label">{icon} {label}</div>
                      <div className="sub-mini-stars">
                        {[1,2,3,4,5].map(i => (
                          <svg
                            key={i}
                            className="sub-star"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill={i<=subRatings[key]?"#F59E0B":"none"}
                            stroke={i<=subRatings[key]?"#F59E0B":"rgba(255,255,255,.25)"}
                            strokeWidth="1.5"
                            onClick={() => setSubRatings(s=>({...s,[key]:i===s[key]?0:i}))}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                      {subRatings[key] > 0 && (
                        <div style={{ fontSize:11.5, color:"#F59E0B", marginTop:5 }}>{STAR_LABELS[subRatings[key]]}</div>
                      )}
                    </div>
                  ))}
                </div>
 
                {/* written review */}
                <div className="rv-comment-wrap">
                  <div className="rv-sec-h" style={{ marginBottom:10 }}>Write your review</div>
                  <textarea
                    className="rv-textarea"
                    placeholder="Describe your experience. Was the provider on time? How was the quality of work? Would you recommend them?"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="char-count">{comment.length} / 500</div>
                </div>
 
                {/* error */}
                {error && <div className="rv-error">⚠ {error}</div>}
 
                {/* submit */}
                <button className="rv-submit" onClick={submitReview} disabled={submitting || !rating}>
                  {submitting
                    ? <><div className="spin"/>Submitting Review…</>
                    : <>⭐ Submit Review</>
                  }
                </button>
              </>
            )}
          </div>
        )}
 
        {/* ════════════════════════════════════════════════════
            VIEW REVIEWS MODE
        ════════════════════════════════════════════════════ */}
        {mode === "view" && (
          <div className="rv-view">
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(22px,3.5vw,36px)", fontWeight:800, color:"white", letterSpacing:"-1px", marginBottom:6 }}>
              Customer Reviews
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginBottom:28 }}>
              Real reviews from verified customers.
            </p>
 
            <div className="rv-view-header">
              {/* rating summary */}
              <div className="rv-summary">
                <div className="rv-big-rating">{avgRating}</div>
                <Stars r={Number(avgRating) || 0} size={16}/>
                <div className="rv-rating-label">{total} reviews</div>
                {[5,4,3,2,1].map(star => (
                  <div className="rv-dist-row" key={star}>
                    <div className="rv-dist-star">{star}★</div>
                    <div className="rv-dist-bar">
                      <div className="rv-dist-fill" style={{ width:`${((ratingDist[star]||0)/totalDistCount)*100}%` }}/>
                    </div>
                    <div className="rv-dist-count">{ratingDist[star]||0}</div>
                  </div>
                ))}
              </div>
 
              {/* right side placeholder / info */}
              <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <div style={{ background:"rgba(255,255,255,.03)", border:"0.5px solid rgba(255,255,255,.08)", borderRadius:14, padding:18 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"white", marginBottom:8 }}>About Reviews</div>
                  <div style={{ fontSize:13.5, color:"rgba(255,255,255,.4)", lineHeight:1.75 }}>
                    All reviews are submitted by verified customers who have completed a booking. We don't allow fake or anonymous reviews to ensure trust.
                  </div>
                </div>
              </div>
            </div>
 
            {/* filters */}
            <div className="rv-filters">
              <button className={`rv-filter ${filterRating===0?"on":""}`} onClick={()=>{setFilterRating(0);setPage(1);}}>All</button>
              {[5,4,3,2,1].map(s=>(
                <button key={s} className={`rv-filter ${filterRating===s?"on":""}`} onClick={()=>{setFilterRating(s);setPage(1);}}>
                  {s}★ ({ratingDist[s]||0})
                </button>
              ))}
              <select className="rv-sort" value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1);}}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
 
            {/* review list */}
            {loading ? (
              <div className="rv-list">{[1,2,3,4].map(i=><div key={i} className="rv-skel"/>)}</div>
            ) : reviews.length === 0 ? (
              <div className="rv-empty">
                <div className="rv-empty-ic">💬</div>
                No reviews yet.
              </div>
            ) : (
              <>
                <div className="rv-list">
                  {reviews.map(r => {
                    const isLiked = likedIds.has(r._id);
                    const uName   = r.user?.name || "Customer";
                    const uInit   = uName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                    return (
                      <div className="rv-card" key={r._id}>
                        {/* top row */}
                        <div className="rv-card-top">
                          <div className="rv-user-av">{uInit}</div>
                          <div style={{ flex:1 }}>
                            <div className="rv-user-name">
                              {uName}
                              {r.user && <span className="rv-verified">✓ Verified</span>}
                            </div>
                            <div className="rv-user-meta">
                              <Stars r={r.rating} size={12}/>
                              &nbsp;{r.rating}.0 · {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                            </div>
                          </div>
                          {r.booking?.service && (
                            <span className="rv-service-tag">{r.booking.service?.title || "Service"}</span>
                          )}
                        </div>
 
                        {/* review text */}
                        <div className="rv-text">{r.comment}</div>
 
                        {/* sub ratings */}
                        {r.subRatings && Object.values(r.subRatings).some(v=>v>0) && (
                          <div className="rv-sub-row">
                            {SUB_LABELS.filter(sl=>r.subRatings[sl.key]>0).map(sl=>(
                              <div className="rv-sub-item" key={sl.key}>
                                {sl.icon} {sl.label}: <strong style={{color:"white",marginLeft:3}}>{r.subRatings[sl.key]}/5</strong>
                              </div>
                            ))}
                          </div>
                        )}
 
                        {/* helpful + flag */}
                        <div className="rv-actions">
                          <button
                            className={`rv-helpful-btn ${isLiked?"liked":""}`}
                            onClick={() => toggleHelpful(r._id)}
                          >
                            <svg viewBox="0 0 24 24" style={{ fill: isLiked?"#FB7185":"none" }}>
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                            </svg>
                            {r.helpfulVotes + (isLiked && !likedIds.has(r._id) ? 0 : 0)} Helpful
                          </button>
                          <button className="rv-flag-btn" onClick={() => flagReview(r._id)}>
                            🚩 Report
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
 
                {/* pagination */}
                {total > LIMIT && (
                  <div className="rv-pag">
                    {page > 1 && <button className="rv-pag-btn" onClick={()=>setPage(p=>p-1)}>← Prev</button>}
                    {Array.from({length:Math.ceil(total/LIMIT)},(_,i)=>(
                      <button key={i} className={`rv-pag-btn ${page===i+1?"on":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>
                    ))}
                    {page < Math.ceil(total/LIMIT) && <button className="rv-pag-btn" onClick={()=>setPage(p=>p+1)}>Next →</button>}
                  </div>
                )}
              </>
            )}
          </div>
        )}
 
        {/* ════════════════════════════════════════════════════
            MY REVIEWS MODE
        ════════════════════════════════════════════════════ */}
        {mode === "my" && (
          <div className="rv-write">
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(22px,3.5vw,34px)", fontWeight:800, color:"white", letterSpacing:"-1px", marginBottom:6 }}>
              My Reviews
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginBottom:28 }}>
              Reviews you've written for providers.
            </p>
 
            {myReviews.length === 0 ? (
              <div className="rv-empty">
                <div className="rv-empty-ic">✍</div>
                You haven't written any reviews yet.
                <button onClick={() => navigate("/providers")}
                  style={{ padding:"10px 22px", borderRadius:10, border:"none", background:"#FF6B35", color:"white", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:6 }}>
                  Book a Service →
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {myReviews.map(r => {
                  const pName = r.provider?.user?.name || "Provider";
                  return (
                    <div className="rv-my-card" key={r._id}>
                      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,107,53,.15)", color:"#FF6B35", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, flexShrink:0 }}>
                        {pName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14.5, fontWeight:700, color:"white", marginBottom:2 }}>{pName}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginBottom:6 }}>
                          {r.provider?.category} · {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </div>
                        <Stars r={r.rating} size={13}/>
                        <div style={{ fontSize:13.5, color:"rgba(255,255,255,.65)", marginTop:8, fontStyle:"italic", lineHeight:1.65 }}>
                          "{r.comment}"
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:7, flexShrink:0 }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#F59E0B" }}>{r.rating}★</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>👍 {r.helpfulVotes}</div>
                        <button
                          onClick={() => deleteMyReview(r._id)}
                          style={{ padding:"5px 12px", borderRadius:8, border:"0.5px solid rgba(239,68,68,.25)", background:"rgba(239,68,68,.07)", color:"#F87171", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
 
      </div>
    </>
  );
}