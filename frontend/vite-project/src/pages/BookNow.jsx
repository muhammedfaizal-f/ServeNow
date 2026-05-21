import React from 'react'
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './BookNow.css'

const TIME_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM",
  "04:00 PM","05:00 PM","06:00 PM","07:00 PM",
];
const BOOKED_SLOTS = ["09:00 AM","01:00 PM","04:00 PM"];
 
const MOCK_PROVIDER = {
  _id:"1", name:"Ravi Kumar", role:"Master Plumber", rating:4.9,
  reviews:312, jobs:"800+", price:299, avatar:"RK", color:"#4A90E2",
  bg:"#1e3a5f", badge:"Top Rated", skills:["Pipe Repair","Leak Fix","Tap Install","Drainage"],
  location:"Gandhipuram, Coimbatore", response:"~10 mins", verified:true,
};
const MOCK_SERVICES = [
  { _id:"s1", title:"Pipe Repair",      estimatedDuration:90,  price:299, subCategory:"Pipe Repair",  icon:"🔧" },
  { _id:"s2", title:"Tap Installation", estimatedDuration:45,  price:199, subCategory:"Tap Install",  icon:"🚿" },
  { _id:"s3", title:"Drain Cleaning",   estimatedDuration:60,  price:249, subCategory:"Drainage",     icon:"🪣" },
  { _id:"s4", title:"Full Inspection",  estimatedDuration:150, price:499, subCategory:"Inspection",   icon:"🔍" },
];
 
const DATES = Array.from({length:7}, (_,i) => {
  const d = new Date(); d.setDate(d.getDate() + i);
  return {
    label: i === 0 ? "Today" : i === 1 ? "Tomorrow"
      : d.toLocaleDateString("en-IN", {weekday:"short"}),
    display: d.toLocaleDateString("en-IN", {day:"numeric", month:"short"}),
    full:    d.toISOString().split("T")[0],
  };
});


const STEPS = [{n:1,l:"Service"},{n:2,l:"Schedule"},{n:3,l:"Details"},{n:4,l:"Confirm"}];
 
export default function BookNow() {
  const { providerId } = useParams();
  const navigate       = useNavigate();
 
  const [provider,  setProvider]  = useState(null);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [step,      setStep]      = useState(1);
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(null);   // booking result
  const [error,     setError]     = useState("");
 
  // form state
  const [serviceId, setServiceId] = useState("");
  const [dateIdx,   setDateIdx]   = useState(0);
  const [slot,      setSlot]      = useState("");
  const [payment,   setPayment]   = useState("cash");
  const [notes,     setNotes]     = useState("");
  const [addr,      setAddr]      = useState({ street:"", city:"Coimbatore", pincode:"" });
 
  // ── Load provider + services on mount ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // REAL API — uncomment:
        // const provRes = await providerAPI.getById(providerId);
        // const srvRes  = await serviceAPI.getAll({ category: provRes.data.provider.category });
        // setProvider(provRes.data.provider);
        // setServices(srvRes.data.services);
 
        // Mock fallback:
        await new Promise(r => setTimeout(r, 700));
        setProvider(MOCK_PROVIDER);
        setServices(MOCK_SERVICES);
      } catch (err) {
        setError("Failed to load provider. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [providerId]);
 
  const selectedService = services.find(s => s._id === serviceId);
  const selectedDate    = DATES[dateIdx];
 
  const canNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!slot;
    if (step === 3) return !!addr.street && !!addr.pincode;
    return true;
  };
 
  const handleConfirm = async () => {
  setSubmitting(true);
  setError("");

  try {
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

    body: JSON.stringify({
  providerId: provider?._id,
  serviceId: selectedService?._id,

  bookingDate: selectedDate?.full,

  timeSlot: {
    start: slot,
    end: slot,
  },

  jobAddress: addr,

  paymentMethod: payment,
  userNotes: notes,
}),
    });

    const data = await res.json();

    console.log(data);

    if (data.success) {
      setDone(data.booking);
    } else {
      setError(data.message || "Booking failed");
    }

  } catch (err) {
    console.log(err);
    setError("Booking failed. Please try again.");
  } finally {
    setSubmitting(false);
  }
};
 
  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060D25",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:40,height:40,border:"3px solid rgba(255,107,53,.3)",borderTopColor:"#FF6B35",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>Loading provider…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
 
  // ── Error screen ──────────────────────────────────────────────────────────
  if (error && !provider) return (
    <div style={{minHeight:"100vh",background:"#060D25",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:20}}>
      <div style={{fontSize:48}}>⚠️</div>
      <p style={{color:"rgba(255,255,255,.6)",fontFamily:"'DM Sans',sans-serif",fontSize:15,textAlign:"center"}}>{error}</p>
      <button onClick={() => navigate("/providers")}
        style={{padding:"10px 24px",borderRadius:10,border:"none",background:"#FF6B35",color:"white",fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
        ← Back to Providers
      </button>
    </div>
  );
 
  // ── Done screen ───────────────────────────────────────────────────────────
  if (done) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#060D25;font-family:'DM Sans',sans-serif}
      @keyframes pop{0%{transform:scale(.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{minHeight:"100vh",background:"#060D25",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:20,maxWidth:440}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(16,185,129,.15)",border:"2px solid rgba(16,185,129,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,animation:"pop .5s ease"}}>✓</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:"white",letterSpacing:"-.6px"}}>Booking Confirmed! 🎉</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.45)",lineHeight:1.7}}>
            Your booking with <strong style={{color:"white"}}>{provider?.name}</strong> for <strong style={{color:"white"}}>{selectedService?.title}</strong> on <strong style={{color:"white"}}>{selectedDate.display}</strong> at <strong style={{color:"white"}}>{slot}</strong> has been placed.
          </div>
          <div style={{background:"rgba(255,255,255,.04)",border:"0.5px solid rgba(255,255,255,.09)",borderRadius:14,padding:"14px 24px",display:"flex",flexDirection:"column",gap:4}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Booking ID</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#FF6B35"}}>#{done._id}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Status: <span style={{color:"#F59E0B",fontWeight:500}}>Pending Provider Confirmation</span></div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={() => navigate("/")}
              style={{padding:"11px 22px",borderRadius:10,border:"0.5px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to Home
            </button>
            <button onClick={() => navigate("/providers")}
              style={{padding:"11px 22px",borderRadius:10,border:"none",background:"#FF6B35",color:"white",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Book Another Service
            </button>
          </div>
        </div>
      </div>
    </>
  );



  return (
    <>
    <div className="bn">
 
        {/* ── Main ── */}
        <div className="bn-main">
          <button className="bn-back" onClick={() => navigate("/providers")}>
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to providers
          </button>
 
          {/* stepper */}
          <div className="steps">
            {STEPS.map((s, i, a) => (
              <div key={s.n} className={`st ${step===s.n?"active-st":""} ${step>s.n?"done-st":""}`}>
                <div className="st-c">{step > s.n ? "✓" : s.n}</div>
                <span className="st-l">{s.l}</span>
                {i < a.length-1 && <span style={{flex:1,height:1.5,background:step>s.n?"rgba(255,107,53,.35)":"rgba(255,255,255,.08)",margin:"0 6px"}}/>}
              </div>
            ))}
          </div>
 
          {error && <div className="err-a">⚠ {error}</div>}
 
          {/* Step 1 — Choose service */}
          {step === 1 && (
            <>
              <div className="bn-h">Choose a Service</div>
              <div className="bn-sh">Select what you need from {provider?.name}.</div>
              <div className="srv-g">
                {services.map(s => (
                  <div key={s._id} className={`srv-c ${serviceId===s._id?"on":""}`} onClick={() => setServiceId(s._id)}>
                    <div className="srv-ic">{s.icon}</div>
                    <div className="srv-n">{s.title}</div>
                    <div className="srv-m">
                      <span className="srv-d">⏱ {s.estimatedDuration} min</span>
                      <span className="srv-p">₹{s.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
 
          {/* Step 2 — Date & Time */}
          {step === 2 && (
            <>
              <div className="bn-h">Pick Date & Time</div>
              <div className="bn-sh">Choose when you'd like {provider?.name} to come.</div>
              <div style={{fontSize:"12.5px",color:"rgba(255,255,255,.4)",marginBottom:8}}>Select Date</div>
              <div className="date-row">
                {DATES.map((d,i) => (
                  <div key={i} className={`date-btn ${dateIdx===i?"on":""}`} onClick={() => setDateIdx(i)}>
                    <div className="d-lbl">{d.label}</div>
                    <div className="d-n">{d.display}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:"12.5px",color:"rgba(255,255,255,.4)",marginBottom:10}}>Select Time Slot</div>
              <div className="slots-g">
                {TIME_SLOTS.map(t => {
                  const bkd = BOOKED_SLOTS.includes(t);
                  return (
                    <button key={t} className={`slot-b ${slot===t&&!bkd?"on":""} ${bkd?"bkd":""}`}
                      onClick={() => !bkd && setSlot(t)} disabled={bkd}>
                      {t}{bkd && <span className="bkd-tag">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
 
          {/* Step 3 — Details */}
          {step === 3 && (
            <>
              <div className="bn-h">Job Details</div>
              <div className="bn-sh">Where should {provider?.name} come?</div>
              <div className="df"><label className="dl">Street Address</label>
                <input className="di" placeholder="12 Anna Nagar, RS Puram" value={addr.street} onChange={e => setAddr(a=>({...a,street:e.target.value}))}/>
              </div>
              <div className="dr" style={{marginBottom:14}}>
                <div className="df" style={{marginBottom:0}}><label className="dl">City</label>
                  <select className="dsel" value={addr.city} onChange={e => setAddr(a=>({...a,city:e.target.value}))}>
                    {["Coimbatore","Chennai","Madurai","Trichy","Salem"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="df" style={{marginBottom:0}}><label className="dl">Pincode</label>
                  <input className="di" placeholder="641001" value={addr.pincode} onChange={e => setAddr(a=>({...a,pincode:e.target.value}))}/>
                </div>
              </div>
              <div className="df" style={{marginBottom:16}}><label className="dl">Notes for Provider (optional)</label>
                <textarea className="dta" placeholder="Describe the problem in detail…" value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
              <div className="df" style={{marginBottom:0}}><label className="dl">Payment Method</label>
                <div className="pay-r">
                  {[{v:"cash",l:"💵 Cash on Service"},{v:"online",l:"📱 Pay Online"}].map(p=>(
                    <button key={p.v} className={`pay-b ${payment===p.v?"on":""}`} onClick={()=>setPayment(p.v)}>{p.l}</button>
                  ))}
                </div>
              </div>
            </>
          )}
 
          {/* Step 4 — Review & Confirm */}
          {step === 4 && (
            <>
              <div className="bn-h">Review & Confirm</div>
              <div className="bn-sh">Double-check everything before booking.</div>
              {[
                ["Provider",     provider?.name],
                ["Service",      selectedService?.title || "—"],
                ["Date",         `${DATES[dateIdx].label} · ${DATES[dateIdx].display}`],
                ["Time",         slot || "—"],
                ["Address",      addr.street ? `${addr.street}, ${addr.city} - ${addr.pincode}` : "—"],
                ["Payment",      payment === "cash" ? "Cash on Service" : "Online"],
                ["Total Amount", `₹${selectedService?.price || 0}`],
              ].map(([l,v]) => (
                <div key={l} className="rev-row"><span className="rev-l">{l}</span><span className="rev-v">{v}</span></div>
              ))}
              <div style={{marginTop:14,padding:12,background:"rgba(16,185,129,.06)",border:"0.5px solid rgba(16,185,129,.2)",borderRadius:10,fontSize:12.5,color:"rgba(16,185,129,.8)",lineHeight:1.6}}>
                ✓ Free cancellation up to 2 hours before the appointment.
              </div>
            </>
          )}
 
          {/* Nav buttons */}
          <div className="bn-nav">
            {step > 1 && <button className="b-bk" onClick={() => setStep(s => s-1)}>← Back</button>}
            <button  className="b-nx"
              onClick={step === 4 ? handleConfirm : () => setStep(s => s+1)}
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
 
        {/* ── Sidebar ── */}
        <div className="bn-sb">
          <div className="sb-h">Booking Summary</div>
 
          {provider && (
            <div className="prov-mini">
              <div className="pm-top">
                <div className="pm-av" style={{background:provider.bg,color:provider.color}}>{provider.avatar}</div>
                <div>
                  <div className="pm-name">{provider.name}</div>
                  <div className="pm-role">{provider.role}</div>
                </div>
              </div>
              <div className="pm-st">
                {[[provider.rating+"★","Rating"],[provider.reviews,"Reviews"],[provider.jobs,"Jobs"]].map(([v,l],i)=>(
                  <div key={i} className="pm-s"><div className="pm-sv">{v}</div><div className="pm-sl">{l}</div></div>
                ))}
              </div>
            </div>
          )}
 
          <div>
            <div className="sb-h" style={{marginBottom:12}}>Order Summary</div>
            <div className="order-b">
              <div className="or"><span className="or-l">Service</span><span className="or-v">{selectedService?.title||"—"}</span></div>
              <div className="or"><span className="or-l">Date</span><span className="or-v">{DATES[dateIdx].display}</span></div>
              <div className="or"><span className="or-l">Time</span><span className="or-v">{slot||"—"}</span></div>
              <div className="or"><span className="or-l">Payment</span><span className="or-v">{payment==="cash"?"Cash":"Online"}</span></div>
              <div className="o-div"/>
              <div className="o-tot">
                <span className="ot-l">Total</span>
                <span className="ot-v">₹{selectedService?.price||"—"}</span>
              </div>
            </div>
          </div>
 
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:"auto"}}>
            {["✅ Free cancellation (2hrs before)","🔒 Secure payment","⭐ Verified professional","📞 24/7 support"].map((t,i)=>(
              <div key={i} style={{fontSize:12.5,color:"rgba(255,255,255,.35)"}}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

