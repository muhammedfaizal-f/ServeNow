import React from 'react'
import { useState } from 'react'
import './Howitworks.css'
import { Link } from 'react-router-dom';

    const steps = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    title: "Choose a Service",
    desc: "Search from 20+ categories or browse by need. Find exactly what you're looking for in seconds.",
    color: "#FF6B35",
    bg: "#3d1500",
    detail: {
      label: "Popular right now",
      items: ["AC Repair", "Deep Cleaning", "Plumbing", "Electrician"],
    },
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "Pick a Provider",
    desc: "Browse verified profiles, read real reviews, compare prices and availability — all in one place.",
    color: "#4A90E2",
    bg: "#062036",
    detail: {
      label: "Provider highlights",
      items: ["Verified ID", "Star Ratings", "Price Range", "Availability"],
    },
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Book & Confirm",
    desc: "Choose your preferred time slot, confirm your address, and pay securely — online or cash on arrival.",
    color: "#10B981",
    bg: "#042318",
    detail: {
      label: "Booking options",
      items: ["Pick Time Slot", "Pay Online", "Cash on Service", "Instant Confirm"],
    },
  },
  {
    number: "04",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Get It Done & Rate",
    desc: "Your provider arrives on time, completes the job, and you leave a review to help the community.",
    color: "#A78BFA",
    bg: "#1e0f3d",
    detail: {
      label: "After service",
      items: ["Rate Provider", "Leave Review", "Rebook Easily", "Share Receipt"],
    },
  },
];
 
const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <>
     <section className="hiw-root">
        <div className="hiw-blob hiw-blob-1" />
        <div className="hiw-blob hiw-blob-2" />
 
        <div className="hiw-inner">
 
          {/* Header */}
          <div className="hiw-header">
            <div className="hiw-eyebrow">
              <div className="hiw-eyebrow-line" />
              <span className="hiw-eyebrow-text">Simple process</span>
              <div className="hiw-eyebrow-line" />
            </div>
            <h2 className="hiw-title">Book a Service in<br /><span>4 Easy Steps</span></h2>
            <p className="hiw-subtitle">No calls, no confusion. Just pick, book, and relax — we handle the rest.</p>
          </div>
 
          {/* Tabs */}
          <div className="hiw-tabs">
            {steps.map((s, i) => (
              <button
                key={i}
                className={`hiw-tab ${activeStep === i ? "active" : ""}`}
                onClick={() => setActiveStep(i)}
                style={activeStep === i ? {
                  background: `${s.color}15`,
                  borderColor: `${s.color}35`,
                  color: s.color,
                } : {}}
              >
                <span
                  className="hiw-tab-num"
                  style={activeStep === i ? {
                    background: `${s.color}25`,
                    color: s.color,
                  } : {
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {s.number}
                </span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
 
          {/* Main 2-col content */}
          <div className="hiw-content">
 
            {/* Left — active step detail */}
            <div className="hiw-left">
              <div
                className="step-number-display"
                style={{ color: `${steps[activeStep].color}20` }}
              >
                {steps[activeStep].number}
              </div>
 
              <div
                className="step-icon-big"
                style={{
                  background: `${steps[activeStep].color}18`,
                  border: `0.5px solid ${steps[activeStep].color}30`,
                  color: steps[activeStep].color,
                }}
              >
                {steps[activeStep].icon}
              </div>
 
              <div>
                <h3 className="step-title-big">{steps[activeStep].title}</h3>
                <p className="step-desc-big">{steps[activeStep].desc}</p>
              </div>
 
              <div className="step-tags">
                <div className="step-tags-label">{steps[activeStep].detail.label}</div>
                <div className="step-tags-row">
                  {steps[activeStep].detail.items.map((tag, j) => (
                    <span
                      key={j}
                      className="step-tag"
                      style={{
                        color: steps[activeStep].color,
                        borderColor: `${steps[activeStep].color}30`,
                        background: `${steps[activeStep].color}10`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
 
              <div className="step-nav">
                <button
                  className="step-nav-btn"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  className="step-nav-btn"
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                >
                  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
 
            {/* Right — step cards */}
            <div className="hiw-right">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`step-card ${activeStep === i ? "active" : ""}`}
                  onClick={() => setActiveStep(i)}
                  style={activeStep === i ? {
                    borderColor: `${s.color}25`,
                    background: `${s.bg}80`,
                  } : {}}
                >
                  {/* left accent bar */}
                  <div
                    style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: 3, borderRadius: "0 2px 2px 0",
                      background: s.color,
                      opacity: activeStep === i ? 1 : 0,
                      transition: "opacity 0.3s",
                    }}
                  />
 
                  <span
                    className="card-num"
                    style={{ color: activeStep === i ? s.color : "rgba(255,255,255,0.2)" }}
                  >
                    {s.number}
                  </span>
 
                  <div
                    className="card-icon"
                    style={{
                      background: activeStep === i ? `${s.color}20` : "rgba(255,255,255,0.04)",
                      border: `0.5px solid ${activeStep === i ? s.color + "30" : "rgba(255,255,255,0.06)"}`,
                      color: activeStep === i ? s.color : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {s.icon}
                  </div>
 
                  <div className="card-body">
                    <div className="card-title">{s.title}</div>
                    <div className="card-desc">{s.desc}</div>
                  </div>
 
                  <div
                    className="card-check"
                    style={activeStep === i ? {
                      background: `${s.color}20`,
                      borderColor: `${s.color}50`,
                    } : {}}
                  >
                    <svg viewBox="0 0 24 24"
                      style={{ stroke: activeStep === i ? s.color : "rgba(255,255,255,0.25)", opacity: activeStep === i ? 1 : 0 }}
                    >
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Progress dots */}
          <div className="hiw-progress">
            {steps.map((s, i) => (
              <div
                key={i}
                className="progress-dot"
                onClick={() => setActiveStep(i)}
                style={{
                  width: activeStep === i ? 28 : 8,
                  background: activeStep === i ? s.color : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
 
          {/* CTA */}
          <div className="hiw-cta">
            <p className="hiw-cta-text">Ready to get started? It only takes 2 minutes.</p>
            <Link to={"/book/:id"} >
            <button className="hiw-cta-btn">
              Book Your First Service
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            </Link>
            <span className="hiw-cta-note">No registration required to browse</span>
          </div>
 
        </div>
      </section>
    </>
  )
}

export default HowItWorks;