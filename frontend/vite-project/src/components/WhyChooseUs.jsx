import React from 'react'
import { useState } from 'react'
import './WhyChooseUs.css'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "Verified Professionals",
    desc: "Every provider goes through background checks, skill verification, and ID validation before joining our platform.",
    color: "#10B981",
    stat: "100%",
    statLabel: "Background Checked",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    title: "Transparent Pricing",
    desc: "No hidden charges, no surprises. See the full price estimate before you confirm your booking.",
    color: "#F59E0B",
    stat: "₹0",
    statLabel: "Hidden Charges",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "On-Time Guarantee",
    desc: "Providers commit to your chosen time slot. Late arrival? You get a discount on your next booking.",
    color: "#4A90E2",
    stat: "95%",
    statLabel: "On-Time Arrivals",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
      </svg>
    ),
    title: "Easy Rescheduling",
    desc: "Plans changed? Reschedule or cancel for free up to 2 hours before your service with zero penalty.",
    color: "#A78BFA",
    stat: "Free",
    statLabel: "Cancellation",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    title: "24/7 Support",
    desc: "Got a problem? Our support team is available round the clock via chat, call, or email — always here for you.",
    color: "#FF6B35",
    stat: "24/7",
    statLabel: "Live Support",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: "Ratings & Reviews",
    desc: "Real reviews from real customers. Every rating is verified post-service so you always know what to expect.",
    color: "#FB7185",
    stat: "4.8★",
    statLabel: "Average Rating",
  },
];
 
const trustBadges = [
  { icon: "🔒", text: "SSL Secured Payments" },
  { icon: "📋", text: "Licensed & Insured" },
  { icon: "🇮🇳", text: "Made in India" },
  { icon: "♻️", text: "Eco-Friendly Practices" },
];
 
const WhyChooseUs = () => {
  const [hovered, setHovered] = useState(null);


  return (
    
    <>
    <section className="wcu-root">
        <div className="wcu-blob wcu-blob-1" />
        <div className="wcu-blob wcu-blob-2" />
        <div className="wcu-bg-text">TRUST</div>
 
        <div className="wcu-inner">
 
          {/* Header */}
          <div className="wcu-header">
            <div>
              <div className="wcu-eyebrow">
                <div className="wcu-eyebrow-line" />
                <span className="wcu-eyebrow-text">Why us</span>
              </div>
              <h2 className="wcu-title">Why Thousands<br /><span>Trust ServeNow</span></h2>
            </div>
            <div className="wcu-header-right">
              <p className="wcu-subtitle">
                We don't just connect you with workers — we guarantee quality, safety, and satisfaction at every step.
              </p>
              <div className="wcu-trust">
                {trustBadges.map((b, i) => (
                  <div className="trust-badge" key={i}>
                    <span>{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Features Grid */}
          <div className="wcu-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className={`feat-card ${hovered === i ? "hov" : ""}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i
                    ? `linear-gradient(135deg, ${f.color}0a 0%, rgba(255,255,255,0.02) 100%)`
                    : undefined,
                  borderColor: hovered === i ? `${f.color}25` : undefined,
                  "--glow": f.color,
                }}
              >
                {/* corner glow color */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 120, height: 120, borderRadius: "50%",
                  background: f.color,
                  filter: "blur(40px)",
                  opacity: hovered === i ? 0.12 : 0,
                  transition: "opacity 0.4s",
                  pointerEvents: "none",
                }} />
 
                <div className="feat-top">
                  <div
                    className="feat-icon"
                    style={{
                      background: `${f.color}18`,
                      border: `0.5px solid ${f.color}30`,
                      color: f.color,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div className="feat-stat-box">
                    <div
                      className="feat-stat"
                      style={{ color: hovered === i ? f.color : "white" }}
                    >
                      {f.stat}
                    </div>
                    <div className="feat-stat-label">{f.statLabel}</div>
                  </div>
                </div>
 
                <div className="feat-body">
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
 
                <button
                  className="feat-link"
                  style={{ color: f.color }}
                >
                  Learn more
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            ))}
          </div>
 
          {/* Comparison strip */}
          <div className="wcu-compare">
            <div className="compare-col">
              <div className="compare-heading bad">❌ Without ServeNow</div>
              {[
                "Unknown workers, no verification",
                "Prices change at doorstep",
                "No accountability if late",
                "No recourse after bad service",
                "Haggling over every job",
              ].map((t, i) => (
                <div className="compare-row" key={i}>
                  <svg viewBox="0 0 24 24" stroke="#F87171"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{t}</span>
                </div>
              ))}
            </div>
 
            <div className="compare-vs">VS</div>
 
            <div className="compare-col right">
              <div className="compare-heading good">✅ With ServeNow</div>
              {[
                "ID & skill verified professionals",
                "Upfront pricing, no surprises",
                "On-time guarantee or discount",
                "Rated reviews & dispute support",
                "Fixed transparent rates always",
              ].map((t, i) => (
                <div className="compare-row" key={i}>
                  <svg viewBox="0 0 24 24" stroke="#34D399"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
 
        </div>
      </section>
    </>
  )
}

export default WhyChooseUs