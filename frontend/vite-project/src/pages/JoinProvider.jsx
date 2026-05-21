import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './JoinProvider.css';


const CATS = [
  { v: "Plumbing", icon: "🔧", c: "#4A90E2" }, { v: "Electrician", icon: "⚡", c: "#F59E0B" },
  { v: "Home Cleaning", icon: "🧹", c: "#10B981" }, { v: "Painting", icon: "🎨", c: "#EC4899" },
  { v: "AC Repair", icon: "❄️", c: "#06B6D4" }, { v: "Carpentry", icon: "🛠", c: "#F97316" },
  { v: "Tutoring", icon: "📚", c: "#A78BFA" }, { v: "Pet Care", icon: "🐾", c: "#FB7185" },
  { v: "Gardening", icon: "🪴", c: "#4ADE80" }, { v: "Moving Help", icon: "📦", c: "#FCD34D" },
  { v: "Locksmith", icon: "🔑", c: "#94A3B8" }, { v: "Home Cook", icon: "🍳", c: "#FF6B35" },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STEPS = [{ n: 1, l: "Basic Info", ic: "👤" }, { n: 2, l: "Your Service", ic: "🔧" }, { n: 3, l: "Availability", ic: "📅" }, { n: 4, l: "Location", ic: "📍" }];

export default function JoinProvider() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    bio: "", category: "", skills: "", experience: "0",
    hourlyRate: "", pricingType: "hourly",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    startTime: "08:00", endTime: "20:00",
    city: "Coimbatore", address: "", pincode: "",
  });

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (d) => {
    const days = form.days.includes(d)
      ? form.days.filter(x => x !== d)
      : [...form.days, d];
    u("days", days);
  };

  const validate = () => {
    if (step === 1) {
      if (!form.name.trim()) return "Name is required.";
      if (!form.email.trim()) return "Email is required.";
      if (!form.password.trim()) return "Password is required.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === 2) {
      if (!form.category) return "Please select a service category.";
      if (!form.hourlyRate) return "Hourly rate is required.";
    }
    if (step === 3) {
      if (form.days.length === 0) return "Select at least one working day.";
    }
    if (step === 4) {
      if (!form.address.trim()) return "Address is required.";
      if (!form.pincode.trim()) return "Pincode is required.";
    }
    return "";
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      // REAL API — uncomment:
      // await authAPI.register({
      //   name:       form.name,
      //   email:      form.email,
      //   password:   form.password,
      //   phone:      form.phone,
      //   role:       "provider",
      //   category:   form.category,
      //   hourlyRate: Number(form.hourlyRate),
      // });

      // Mock:
      await new Promise(r => setTimeout(r, 1800));
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
     <div className="jp">
        <div className="jp-b jp-b1"/><div className="jp-b jp-b2"/>
 
        <div className="jp-hd">
          <button className="jp-back" onClick={() => navigate("/")}>← Back to Home</button>
          <div/><div className="jp-tag">🔧 Join 500+ professionals on ServeNow</div>
          <h1 className="jp-title">Become a <span>Provider</span></h1>
          <p className="jp-sub">Set your own hours, earn on your terms. Complete your profile in 4 steps.</p>
        </div>
 
        {/* stepper */}
        <div className="stepper">
          {STEPS.map(s => (
            <div key={s.n} className={`st-item ${step===s.n?"active-i":""} ${step>s.n?"done-i":""}`}>
              <div className="st-circle">{step > s.n ? "✓" : s.ic}</div>
              <div className="st-lbl">{s.l}</div>
            </div>
          ))}
        </div>
 
        <div className="jp-card">
          {done ? (
            <div className="done-sc">
              <div className="done-ic">🎉</div>
              <div className="done-t">You're all set, {form.name.split(" ")[0]}!</div>
              <div className="done-p">Your provider profile has been submitted. Our team will verify your ID within 24 hours.</div>
              <div className="done-steps">
                {["Profile submitted for review","You'll receive an email once verified","Go live and start receiving bookings!"].map((t,i)=>(
                  <div className="done-step" key={i}><span>✓</span>{t}</div>
                ))}
              </div>
              <button onClick={() => navigate("/login")}
                style={{marginTop:8,padding:"12px 28px",borderRadius:10,border:"none",background:"#FF6B35",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer"}}>
                Sign In to Dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* ── Step 1 ── */}
              {step===1 && <>
                <div className="step-h">Basic Information</div>
                <div className="step-sh">Tell us about yourself.</div>
                {error && <div className="err-box">⚠ {error}</div>}
                <div className="frow">
                  <div className="f"><label className="fl">Full Name</label><input className="fi" placeholder="Ravi Kumar" value={form.name} onChange={e=>u("name",e.target.value)}/></div>
                  <div className="f"><label className="fl">Phone</label><input className="fi" placeholder="9876543210" value={form.phone} onChange={e=>u("phone",e.target.value)}/></div>
                </div>
                <div className="f"><label className="fl">Email Address</label><input className="fi" type="email" placeholder="you@example.com" value={form.email} onChange={e=>u("email",e.target.value)}/></div>
                <div className="f"><label className="fl">Password (min 6 chars)</label><input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={e=>u("password",e.target.value)}/></div>
                <div className="f" style={{marginBottom:0}}><label className="fl">Short Bio</label><textarea className="fta" placeholder="Experienced plumber with 8 years in residential projects…" value={form.bio} onChange={e=>u("bio",e.target.value)}/></div>
              </>}
 
              {/* ── Step 2 ── */}
              {step===2 && <>
                <div className="step-h">Your Service</div>
                <div className="step-sh">Choose your category and pricing.</div>
                {error && <div className="err-box">⚠ {error}</div>}
                <div className="f" style={{marginBottom:16}}>
                  <label className="fl">Service Category</label>
                  <div className="cat-g">
                    {CATS.map(c=>(
                      <button key={c.v} className={`cat-b ${form.category===c.v?"on":""}`}
                        style={form.category===c.v?{background:`${c.c}15`,borderColor:`${c.c}40`}:{}}
                        onClick={()=>u("category",c.v)}>
                        <span className="cat-ic">{c.icon}</span>
                        <span className="cat-n">{c.v}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="f"><label className="fl">Your Skills (comma separated)</label><input className="fi" placeholder="Pipe Repair, Leak Fix, Tap Install" value={form.skills} onChange={e=>u("skills",e.target.value)}/></div>
                <div className="frow">
                  <div className="f"><label className="fl">Experience (years)</label><input className="fi" type="number" min="0" value={form.experience} onChange={e=>u("experience",e.target.value)}/></div>
                  <div className="f"><label className="fl">Hourly Rate (₹)</label><input className="fi" type="number" placeholder="299" value={form.hourlyRate} onChange={e=>u("hourlyRate",e.target.value)}/></div>
                </div>
                <div className="f" style={{marginBottom:0}}>
                  <label className="fl">Pricing Type</label>
                  <div className="pt-row">
                    {["hourly","fixed","negotiable"].map(p=>(
                      <button key={p} className={`pt-b ${form.pricingType===p?"on":""}`} onClick={()=>u("pricingType",p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                    ))}
                  </div>
                </div>
              </>}
 
              {/* ── Step 3 ── */}
              {step===3 && <>
                <div className="step-h">Your Availability</div>
                <div className="step-sh">Let customers know when you work.</div>
                {error && <div className="err-box">⚠ {error}</div>}
                <div className="f">
                  <label className="fl">Working Days</label>
                  <div className="days-row">
                    {DAYS.map(d=>(
                      <button key={d} className={`day-b ${form.days.includes(d)?"on":""}`} onClick={()=>toggleDay(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="frow" style={{marginBottom:0}}>
                  <div className="f" style={{marginBottom:0}}><label className="fl">Start Time</label><input className="fi" type="time" value={form.startTime} onChange={e=>u("startTime",e.target.value)}/></div>
                  <div className="f" style={{marginBottom:0}}><label className="fl">End Time</label><input className="fi" type="time" value={form.endTime} onChange={e=>u("endTime",e.target.value)}/></div>
                </div>
              </>}
 
              {/* ── Step 4 ── */}
              {step===4 && <>
                <div className="step-h">Your Location</div>
                <div className="step-sh">Customers nearby will find you here.</div>
                {error && <div className="err-box">⚠ {error}</div>}
                <div className="f"><label className="fl">Street Address</label><input className="fi" placeholder="12 Anna Nagar, RS Puram" value={form.address} onChange={e=>u("address",e.target.value)}/></div>
                <div className="frow" style={{marginBottom:0}}>
                  <div className="f" style={{marginBottom:0}}><label className="fl">City</label>
                    <select className="fsel" value={form.city} onChange={e=>u("city",e.target.value)}>
                      {["Coimbatore","Chennai","Madurai","Trichy","Salem","Erode"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="f" style={{marginBottom:0}}><label className="fl">Pincode</label><input className="fi" placeholder="641001" value={form.pincode} onChange={e=>u("pincode",e.target.value)}/></div>
                </div>
              </>}
 
              {/* nav */}
              <div className="jp-nav">
                {step > 1 && <button className="b-back" onClick={() => { setError(""); setStep(s=>s-1); }}>← Back</button>}
                <button className="b-next" onClick={step===4?submit:next} disabled={loading}>
                  {loading
                    ? <><div className="spin"/>Submitting…</>
                    : step===4
                      ? <>Submit Profile <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></>
                      : <>Next Step <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

