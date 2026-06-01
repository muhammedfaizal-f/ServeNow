import React from 'react'
import { useState, useEffect } from "react";
import './BookNow.css'
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios"; // ← your axios instance with baseURL + JWT
 
// ─────────────────────────────────────────────────────────────────────────────
// HELPER: generate icon from category name
// ─────────────────────────────────────────────────────────────────────────────
const catIcon = (cat = "") => {
  const map = {
    Plumbing:"🔧", Electrician:"⚡", "Home Cleaning":"🧹",
    Painting:"🎨", "AC Repair":"❄️", Carpentry:"🛠",
    Tutoring:"📚", "Pet Care":"🐾", Gardening:"🪴",
    "Moving Help":"📦", Locksmith:"🔑", "Home Cook":"🍳",
  };
  return map[cat] || "🛠";
};
 
// ─────────────────────────────────────────────────────────────────────────────
// DATES: next 7 days
// ─────────────────────────────────────────────────────────────────────────────
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label:   i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
    display: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    full:    d.toISOString().split("T")[0],
  };
});
 
const TIME_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM",
  "04:00 PM","05:00 PM","06:00 PM","07:00 PM",
];
 
const STEPS = [{ n:1, l:"Service" },{ n:2, l:"Schedule" },{ n:3, l:"Details" },{ n:4, l:"Confirm" }];
 
// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BookNow() {
  const { providerId } = useParams();   // ← from URL: /book/:providerId
  const navigate       = useNavigate();
  const location       = useLocation(); // ← provider passed via navigate state
 
  // ── State ─────────────────────────────────────────────────────────────────
  const [provider,   setProvider]   = useState(null);
  const [services,   setServices]   = useState([]);
  const [bookedSlots,setBookedSlots]= useState([]);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(null);
  const [error,      setError]      = useState("");
 
  // booking form
  const [serviceId,  setServiceId]  = useState("");
  const [dateIdx,    setDateIdx]    = useState(0);
  const [slot,       setSlot]       = useState("");
  const [payment,    setPayment]    = useState("cash");
  const [notes,      setNotes]      = useState("");
  const [addr,       setAddr]       = useState({ street:"", city:"Coimbatore", pincode:"" });
 
  // ── STEP 1: Load provider + services from real backend ───────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // ── A: Provider may already be passed via navigate(state) ──────────
        // This happens when ExploreProviders/LocationSearch navigates here:
        //   navigate(`/book/${p._id}`, { state: { provider: p } })
        if (location.state?.provider) {
          const p = location.state.provider;
 
          // Normalise provider shape (backend shape vs card shape)
          setProvider({
            _id:          p._id,
            name:         p.user?.name   || p.name   || "Provider",
            role:         p.category     || p.role   || "Service Provider",
            rating:       p.averageRating ?? p.rating ?? 0,
            reviews:      p.totalReviews  ?? p.reviews ?? 0,
            jobs:         p.totalJobsDone ? `${p.totalJobsDone}+` : (p.jobs || "0"),
            price:        p.hourlyRate    ?? p.price  ?? 0,
            avatar:       p.user?.name
                            ? p.user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
                            : (p.avatar || "??"),
            color:        p.color || "#FF6B35",
            bg:           p.bg    || "#1e0a00",
            badge:        p.badge || "Verified",
            location:     p.user?.address?.city || p.location || p["location.city"] || "—",
            response:     p.responseTime || "~15 mins",
            category:     p.category || "",
          });
 
          // ── Fetch services for this provider's category ────────────────
          const cat = p.category || "";
          const srvRes = await api.get("/services", {
            params: { category: cat, limit: 20 },
          });
          const rawServices = srvRes.data.services || [];
 
          // Filter to this provider's own services (by provider field)
          const ownServices = rawServices.filter(
            s => s.provider?._id === p._id || s.provider === p._id
          );
          setServices(
            (ownServices.length > 0 ? ownServices : rawServices).map(s => ({
              ...s,
              icon: catIcon(s.category),
            }))
          );
 
        } else {
          // ── B: No state — fetch provider directly by ID from URL ─────────
          const [provRes, srvRes] = await Promise.all([
            api.get(`/providers/${providerId}`),
            api.get("/services", { params: { limit: 50 } }),
          ]);
 
          const p = provRes.data.provider;
 
          setProvider({
            _id:      p._id,
            name:     p.user?.name   || "Provider",
            role:     p.category     || "Service Provider",
            rating:   p.averageRating ?? 0,
            reviews:  p.totalReviews  ?? 0,
            jobs:     p.totalJobsDone ? `${p.totalJobsDone}+` : "0",
            price:    p.hourlyRate    ?? 0,
            avatar:   p.user?.name
                        ? p.user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
                        : "??",
            color:    "#FF6B35",
            bg:       "#1e0a00",
            badge:    p.badge || "Verified",
            location: p.location?.city || "—",
            response: p.responseTime || "~15 mins",
            category: p.category || "",
          });
 
          // Filter services by this provider
          const allServices = srvRes.data.services || [];
          const ownServices = allServices.filter(
            s => s.provider?._id === providerId || s.provider === providerId
          );
          setServices(
            (ownServices.length > 0 ? ownServices : allServices).map(s => ({
              ...s,
              icon: catIcon(s.category),
            }))
          );
        }
 
        // ── C: Fetch already-booked slots for this date ──────────────────
        // (optional — shows which slots are taken)
        // const bookedRes = await api.get(`/bookings/slots`, { params: { providerId, date: DATES[0].full } });
        // setBookedSlots(bookedRes.data.bookedSlots || []);
 
      } catch (err) {
        console.error("BookNow load error:", err);
        setError(
          err?.response?.data?.message ||
          "Failed to load provider details. Please go back and try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [providerId]);
 
  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedService = services.find(s => s._id === serviceId);
  const selectedDate    = DATES[dateIdx];
 
  const canNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!slot;
    if (step === 3) return !!addr.street.trim() && !!addr.pincode.trim();
    return true;
  };
 
  // ── STEP 4: Confirm booking — sends to real backend ──────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
 
    // Debug log so you can see exact values sent
    console.log("Provider:", provider);
    console.log("Service:", selectedService);
    console.log("Date:", selectedDate);
    console.log("Address:", addr);
    console.log("providerId =", provider?._id);
    console.log("serviceId =", serviceId);
 
    try {
      const payload = {
        providerId:    provider._id,       // real MongoDB ObjectId
        serviceId:     serviceId,          // real MongoDB ObjectId
        bookingDate:   selectedDate.full,  // "2025-08-20"
        timeSlot: {
          start: slot,                     // "10:00 AM"
          end:   slot,                     // same slot as end (backend handles duration)
        },
        jobAddress: {
          street:  addr.street.trim(),
          city:    addr.city,
          state:   "Tamil Nadu",
          pincode: addr.pincode.trim(),
        },
        paymentMethod: payment,
        userNotes:     notes,
      };
 
      console.log("Sending booking payload:", payload);
 
      const res = await api.post("/bookings", payload);
 
      console.log("Booking success:", res.data);
      setDone(res.data.booking);
 
    } catch (err) {
      console.error("Booking error:", err?.response?.data || err.message);
      setError(
        err?.response?.data?.message ||
        "Booking failed. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#060D25", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <div style={{ width:42, height:42, border:"3px solid rgba(255,107,53,.25)", borderTopColor:"#FF6B35", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
      <p style={{ color:"rgba(255,255,255,.4)", fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Loading provider details…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
 
  // ─────────────────────────────────────────────────────────────────────────
  // ERROR SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (error && !provider) return (
    <div style={{ minHeight:"100vh", background:"#060D25", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, textAlign:"center" }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <p style={{ color:"rgba(255,255,255,.65)", fontFamily:"'DM Sans',sans-serif", fontSize:15, maxWidth:360 }}>{error}</p>
      <button onClick={() => navigate("/providers")}
        style={{ padding:"11px 26px", borderRadius:10, border:"none", background:"#FF6B35", color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, cursor:"pointer" }}>
        ← Back to Providers
      </button>
    </div>
  );
 
  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS / DONE SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (done) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#060D25;font-family:'DM Sans',sans-serif}
        @keyframes pop{0%{transform:scale(.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
      `}</style>
      <div style={{ minHeight:"100vh", background:"#060D25", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:20, maxWidth:440 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(16,185,129,.15)", border:"2px solid rgba(16,185,129,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, animation:"pop .5s ease" }}>✓</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"white", letterSpacing:"-.6px" }}>Booking Confirmed! 🎉</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.75 }}>
            Your booking with <strong style={{ color:"white" }}>{provider?.name}</strong> for{" "}
            <strong style={{ color:"white" }}>{selectedService?.title}</strong> on{" "}
            <strong style={{ color:"white" }}>{selectedDate.display}</strong> at{" "}
            <strong style={{ color:"white" }}>{slot}</strong> has been placed.
          </div>
          {/* Booking ID */}
          <div style={{ background:"rgba(255,255,255,.04)", border:"0.5px solid rgba(255,255,255,.09)", borderRadius:14, padding:"14px 28px", display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>Booking ID</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#FF6B35" }}>#{done._id?.slice(-8).toUpperCase()}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>
              Status: <span style={{ color:"#F59E0B", fontWeight:500 }}>Waiting for provider confirmation</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            <button onClick={() => navigate("/")}
              style={{ padding:"11px 22px", borderRadius:10, border:"0.5px solid rgba(255,255,255,.1)", background:"transparent", color:"rgba(255,255,255,.6)", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              ← Home
            </button>
            <button onClick={() => navigate("/providers")}
              style={{ padding:"11px 22px", borderRadius:10, border:"none", background:"#FF6B35", color:"white", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    </>
  );


  return (
    <>
     <div className="bn">
 
        {/* ── MAIN ── */}
        <div className="bn-main">
          <button className="bn-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to providers
          </button>
 
          {/* stepper */}
          <div className="steps">
            {STEPS.map((s, i, a) => (
              <div key={s.n} className={`st ${step===s.n?"active-st":""} ${step>s.n?"done-st":""}`}>
                <div className="st-c">{step > s.n ? "✓" : s.n}</div>
                <span className="st-l">{s.l}</span>
                {i < a.length-1 && (
                  <span style={{flex:1,height:1.5,background:step>s.n?"rgba(255,107,53,.35)":"rgba(255,255,255,.08)",margin:"0 6px"}}/>
                )}
              </div>
            ))}
          </div>
 
          {/* ── error ── */}
          {error && (
            <div className="err-a">
              ⚠ {error}
            </div>
          )}
 
          {/* ════ STEP 1 — Choose Service ════ */}
          {step === 1 && (
            <>
              <div className="bn-h">Choose a Service</div>
              <div className="bn-sh">
                Select what you need from{" "}
                <strong style={{ color:"white" }}>{provider?.name}</strong>.
              </div>
 
              {services.length === 0 ? (
                <div className="no-srv">
                  No services found for this provider.<br/>
                  <span style={{ fontSize:12, marginTop:6, display:"block", color:"rgba(255,255,255,.25)" }}>
                    Provider category: {provider?.category || "Unknown"}
                  </span>
                </div>
              ) : (
                <div className="srv-g">
                  {services.map(s => (
                    <div
                      key={s._id}
                      className={`srv-c ${serviceId === s._id ? "on" : ""}`}
                      onClick={() => setServiceId(s._id)}
                    >
                      <div className="srv-ic">{s.icon || catIcon(s.category)}</div>
                      <div className="srv-n">{s.title}</div>
                      <div className="srv-m">
                        <span className="srv-d">⏱ {s.estimatedDuration} min</span>
                        <span className="srv-p">₹{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
 
          {/* ════ STEP 2 — Date & Time ════ */}
          {step === 2 && (
            <>
              <div className="bn-h">Pick Date & Time</div>
              <div className="bn-sh">
                Choose when you'd like{" "}
                <strong style={{ color:"white" }}>{provider?.name}</strong> to come.
              </div>
 
              <div style={{ fontSize:"12.5px", color:"rgba(255,255,255,.4)", marginBottom:8 }}>Select Date</div>
              <div className="date-row">
                {DATES.map((d, i) => (
                  <div key={i} className={`date-btn ${dateIdx===i?"on":""}`} onClick={() => setDateIdx(i)}>
                    <div className="d-lbl">{d.label}</div>
                    <div className="d-n">{d.display}</div>
                  </div>
                ))}
              </div>
 
              <div style={{ fontSize:"12.5px", color:"rgba(255,255,255,.4)", marginBottom:10 }}>Select Time Slot</div>
              <div className="slots-g">
                {TIME_SLOTS.map(t => {
                  const bkd = bookedSlots.includes(t);
                  return (
                    <button
                      key={t}
                      className={`slot-b ${slot===t&&!bkd?"on":""} ${bkd?"bkd":""}`}
                      onClick={() => !bkd && setSlot(t)}
                      disabled={bkd}
                    >
                      {t}
                      {bkd && <span className="bkd-tag">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
 
          {/* ════ STEP 3 — Address & Payment ════ */}
          {step === 3 && (
            <>
              <div className="bn-h">Job Details</div>
              <div className="bn-sh">Where should <strong style={{color:"white"}}>{provider?.name}</strong> come?</div>
 
              <div className="df">
                <label className="dl">Street Address *</label>
                <input
                  className="di"
                  placeholder="12 Anna Nagar, RS Puram"
                  value={addr.street}
                  onChange={e => setAddr(a => ({ ...a, street: e.target.value }))}
                />
              </div>
 
              <div className="dr" style={{ marginBottom:14 }}>
                <div className="df" style={{ marginBottom:0 }}>
                  <label className="dl">City</label>
                  <select className="dsel" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))}>
                    {["Coimbatore","Chennai","Madurai","Trichy","Salem","Erode","Tiruppur"].map(c=>(
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="df" style={{ marginBottom:0 }}>
                  <label className="dl">Pincode *</label>
                  <input
                    className="di"
                    placeholder="641001"
                    value={addr.pincode}
                    onChange={e => setAddr(a => ({ ...a, pincode: e.target.value }))}
                  />
                </div>
              </div>
 
              <div className="df" style={{ marginBottom:16 }}>
                <label className="dl">Notes for Provider (optional)</label>
                <textarea
                  className="dta"
                  placeholder="Describe the problem in detail…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
 
              <div className="df" style={{ marginBottom:0 }}>
                <label className="dl">Payment Method</label>
                <div className="pay-r">
                  {[{ v:"cash", l:"💵 Cash on Service" },{ v:"online", l:"📱 Pay Online" }].map(p => (
                    <button key={p.v} className={`pay-b ${payment===p.v?"on":""}`} onClick={() => setPayment(p.v)}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
 
          {/* ════ STEP 4 — Review & Confirm ════ */}
          {step === 4 && (
            <>
              <div className="bn-h">Review & Confirm</div>
              <div className="bn-sh">Double-check everything before confirming.</div>
 
              {[
                ["Provider",      provider?.name],
                ["Service",       selectedService?.title || "—"],
                ["Date",          `${DATES[dateIdx].label} · ${DATES[dateIdx].display}`],
                ["Time",          slot || "—"],
                ["Address",       addr.street ? `${addr.street}, ${addr.city} - ${addr.pincode}` : "—"],
                ["Payment",       payment === "cash" ? "Cash on Service" : "Online Payment"],
                ["Total Amount",  `₹${selectedService?.price ?? "—"}`],
              ].map(([l, v]) => (
                <div key={l} className="rev-row">
                  <span className="rev-l">{l}</span>
                  <span className="rev-v">{v}</span>
                </div>
              ))}
 
              <div style={{ marginTop:14, padding:12, background:"rgba(16,185,129,.06)", border:"0.5px solid rgba(16,185,129,.2)", borderRadius:10, fontSize:12.5, color:"rgba(16,185,129,.8)", lineHeight:1.6 }}>
                ✓ Free cancellation up to 2 hours before the appointment.
              </div>
            </>
          )}
 
          {/* nav buttons */}
          <div className="bn-nav">
            {step > 1 && (
              <button className="b-bk" onClick={() => { setStep(s => s-1); setError(""); }}>← Back</button>
            )}
            <button
              className="b-nx"
              onClick={step === 4 ? handleConfirm : () => { if (canNext()) setStep(s => s+1); }}
              disabled={!canNext() || submitting}
            >
              {submitting
                ? <><div className="spin"/>Confirming…</>
                : step === 4
                  ? <>Confirm Booking <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></>
                  : <>Continue <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </div>
        </div>
 
        {/* ── SIDEBAR ── */}
        <div className="bn-sb">
          <div className="sb-h">Booking Summary</div>
 
          {/* provider card */}
          {provider && (
            <div className="prov-mini">
              <div className="pm-top">
                <div className="pm-av" style={{ background: provider.bg, color: provider.color }}>
                  {provider.avatar}
                </div>
                <div>
                  <div className="pm-name">{provider.name}</div>
                  <div className="pm-role">{provider.role}</div>
                </div>
              </div>
              <div className="pm-st">
                {[
                  [provider.rating ? `${provider.rating}★` : "—", "Rating"],
                  [provider.reviews || "—", "Reviews"],
                  [provider.jobs || "—", "Jobs"],
                ].map(([v, l], i) => (
                  <div key={i} className="pm-s">
                    <div className="pm-sv">{v}</div>
                    <div className="pm-sl">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* order summary */}
          <div>
            <div className="sb-h" style={{ marginBottom:12 }}>Order Summary</div>
            <div className="order-b">
              <div className="or"><span className="or-l">Service</span><span className="or-v">{selectedService?.title || "—"}</span></div>
              <div className="or"><span className="or-l">Date</span><span className="or-v">{DATES[dateIdx].display}</span></div>
              <div className="or"><span className="or-l">Time</span><span className="or-v">{slot || "—"}</span></div>
              <div className="or"><span className="or-l">Payment</span><span className="or-v">{payment === "cash" ? "Cash" : "Online"}</span></div>
              <div className="o-div"/>
              <div className="o-tot">
                <span className="ot-l">Total</span>
                <span className="ot-v">₹{selectedService?.price || "—"}</span>
              </div>
            </div>
          </div>
 
          {/* trust badges */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:"auto" }}>
            {[
              "✅ Free cancellation (2 hrs before)",
              "🔒 Secure payment",
              "⭐ Verified professional",
              "📞 24/7 support",
            ].map((t, i) => (
              <div key={i} style={{ fontSize:12.5, color:"rgba(255,255,255,.35)" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

