import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './Testimonials.css';


const testimonials = [
  {
    name: "Priya Ramesh",
    location: "Gandhipuram, Coimbatore",
    role: "Homeowner",
    avatar: "PR",
    avatarBg: "#1e3a5f",
    avatarColor: "#4A90E2",
    rating: 5,
    service: "Plumbing",
    serviceIcon: "🔧",
    serviceColor: "#4A90E2",
    text: "Booked a plumber within 5 minutes and he arrived exactly on time. The pipe leak that had been troubling us for weeks was fixed in under an hour. Absolutely loved the transparent pricing — no surprises at the end!",
    date: "2 days ago",
    helpful: 24,
    verified: true,
  },
  {
    name: "Arun Kumar",
    location: "RS Puram, Coimbatore",
    role: "Software Engineer",
    avatar: "AK",
    avatarBg: "#0a2e18",
    avatarColor: "#10B981",
    rating: 5,
    service: "Home Cleaning",
    serviceIcon: "🧹",
    serviceColor: "#10B981",
    text: "The cleaning team was incredibly thorough. They tackled every corner of my apartment including the kitchen and bathrooms. Rescheduling was a breeze when my plans changed last minute. Will definitely rebook!",
    date: "5 days ago",
    helpful: 31,
    verified: true,
  },
  {
    name: "Divya S.",
    location: "Saibaba Colony, CBE",
    role: "Teacher",
    avatar: "DS",
    avatarBg: "#1e0f3d",
    avatarColor: "#A78BFA",
    rating: 5,
    service: "AC Repair",
    serviceIcon: "❄️",
    serviceColor: "#06B6D4",
    text: "My AC stopped working in peak summer and I was panicking. ServeNow connected me with a technician in under 10 minutes. He diagnosed and fixed the issue on the same visit. Life-saving service, honestly.",
    date: "1 week ago",
    helpful: 47,
    verified: true,
  },
  {
    name: "Karthikeyan M.",
    location: "Peelamedu, Coimbatore",
    role: "Business Owner",
    avatar: "KM",
    avatarBg: "#3d1500",
    avatarColor: "#FF6B35",
    rating: 4,
    service: "Electrician",
    serviceIcon: "⚡",
    serviceColor: "#F59E0B",
    text: "Needed urgent wiring work done before an office event. The electrician was professional, knew his craft well, and finished ahead of schedule. The in-app chat made communication so easy.",
    date: "1 week ago",
    helpful: 18,
    verified: true,
  },
  {
    name: "Sneha P.",
    location: "Saravanampatti, CBE",
    role: "Working Mom",
    avatar: "SP",
    avatarBg: "#3b0a17",
    avatarColor: "#FB7185",
    rating: 5,
    service: "Home Cook",
    serviceIcon: "🍳",
    serviceColor: "#FB7185",
    text: "Having a home cook through ServeNow has changed my life. Fresh meals every day, customized to my family's diet. The cook is punctual, hygienic, and the food is restaurant quality. 10/10 recommend!",
    date: "2 weeks ago",
    helpful: 52,
    verified: true,
  },
  {
    name: "Rajesh T.",
    location: "Singanallur, Coimbatore",
    role: "Retired Professional",
    avatar: "RT",
    avatarBg: "#052030",
    avatarColor: "#06B6D4",
    rating: 5,
    service: "Carpentry",
    serviceIcon: "🛠",
    serviceColor: "#F97316",
    text: "The carpenter built custom shelves exactly as I described. He was patient with my requirements, showed up with all the right tools, and cleaned up after himself. The quality of work was exceptional.",
    date: "3 weeks ago",
    helpful: 29,
    verified: true,
  },
];
 
const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "4.8/5", label: "Overall Rating" },
  { value: "98%", label: "Would Recommend" },
  { value: "500+", label: "Reviews This Month" },
];
 
const StarRow = ({ rating, color = "#F59E0B" }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" width="13" height="13"
        fill={i < rating ? color : "none"}
        stroke={i < rating ? color : "rgba(255,255,255,0.18)"}
        strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);
 
const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState({});
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);
 
  const goTo = (idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
    }, 200);
  };
 
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);
 
  const handleLike = (i) => {
    setLiked(prev => ({ ...prev, [i]: !prev[i] }));
  };
 
  const prev = () => goTo((active - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((active + 1) % testimonials.length);
 

    return (
        <>
        <section className="tm-root">
        <div className="tm-blob tm-blob-1" />
        <div className="tm-blob tm-blob-2" />
        <div className="tm-quote-bg">"</div>
 
        <div className="tm-inner">
 
          {/* Stats bar */}
          <div className="tm-stats">
            {stats.map((s, i) => (
              <div className="tm-stat" key={i}>
                <div className="tm-stat-val">{s.value}</div>
                <div className="tm-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
 
          {/* Header */}
          <div className="tm-header">
            <div className="tm-eyebrow">
              <div className="tm-eyebrow-line" />
              <span className="tm-eyebrow-text">Customer stories</span>
              <div className="tm-eyebrow-line" />
            </div>
            <h2 className="tm-title">What Our <span>Customers</span> Say</h2>
            <p className="tm-subtitle">Over 10,000 happy customers across Coimbatore. Here's what they think.</p>
          </div>
 
          {/* Featured + Mini stack */}
          <div className="tm-featured">
 
            {/* Big active card */}
            <div
              className="tm-big-card"
              style={{
                borderColor: `${testimonials[active].serviceColor}22`,
                background: `linear-gradient(135deg, ${testimonials[active].serviceColor}08 0%, rgba(255,255,255,0.02) 100%)`,
              }}
            >
              {/* decorative quote */}
              <div style={{
                position: "absolute", top: 20, right: 28,
                fontSize: 100, fontFamily: "Georgia, serif", lineHeight: 1,
                color: `${testimonials[active].serviceColor}18`,
                pointerEvents: "none",
              }}>
                "
              </div>
 
              <div className="tm-big-top">
                <div
                  className="tm-big-avatar"
                  style={{
                    background: testimonials[active].avatarBg,
                    color: testimonials[active].avatarColor,
                  }}
                >
                  {testimonials[active].avatar}
                </div>
                <div className="tm-big-info">
                  <div className="tm-big-name">{testimonials[active].name}</div>
                  <div className="tm-big-role">{testimonials[active].role}</div>
                  <div className="tm-big-location">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {testimonials[active].location}
                  </div>
                </div>
                {testimonials[active].verified && (
                  <div className="tm-verified">
                    ✓ Verified
                  </div>
                )}
              </div>
 
              <StarRow rating={testimonials[active].rating} color={testimonials[active].serviceColor} />
 
              <p
                className="tm-big-text"
                style={{ opacity: animating ? 0 : 1 }}
              >
                "{testimonials[active].text}"
              </p>
 
              <div className="tm-big-bottom">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div
                    className="tm-service-tag"
                    style={{
                      color: testimonials[active].serviceColor,
                      borderColor: `${testimonials[active].serviceColor}28`,
                      background: `${testimonials[active].serviceColor}10`,
                    }}
                  >
                    <span>{testimonials[active].serviceIcon}</span>
                    <span>{testimonials[active].service}</span>
                  </div>
                  <span className="tm-date">{testimonials[active].date}</span>
                </div>
                <div className="tm-helpful">
                  <button
                    className={`tm-helpful-btn ${liked[active] ? "liked" : ""}`}
                    onClick={() => handleLike(active)}
                  >
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    {liked[active]
                      ? testimonials[active].helpful + 1
                      : testimonials[active].helpful} helpful
                  </button>
                </div>
              </div>
            </div>
 
            {/* Mini cards */}
            <div className="tm-mini-stack">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`tm-mini-card ${active === i ? "active-mini" : ""}`}
                  onClick={() => goTo(i)}
                  style={active === i ? {
                    borderColor: `${t.serviceColor}28`,
                    background: `${t.serviceColor}08`,
                  } : {}}
                >
                  <div
                    className="tm-mini-left-bar"
                    style={{
                      background: t.serviceColor,
                      opacity: active === i ? 1 : 0,
                    }}
                  />
                  <div className="tm-mini-top">
                    <div
                      className="tm-mini-avatar"
                      style={{ background: t.avatarBg, color: t.avatarColor }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="tm-mini-name">{t.name}</div>
                      <div className="tm-mini-service">
                        {t.serviceIcon} {t.service} · {t.date}
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                      <StarRow rating={t.rating} color={t.serviceColor} />
                    </div>
                  </div>
                  <p className="tm-mini-text">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
 
          {/* Navigation */}
          <div className="tm-nav">
            <button className="tm-nav-btn" onClick={prev}>
              <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="tm-dots">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="tm-dot"
                  onClick={() => goTo(i)}
                  style={{
                    width: active === i ? 28 : 7,
                    background: active === i ? t.serviceColor : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
            <button className="tm-nav-btn" onClick={next}>
              <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
 
          {/* CTA */}
          <div className="tm-cta">
            <span className="tm-cta-text">Used ServeNow? Share your experience.</span>
            <button className="tm-cta-btn">
              <svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Write a Review
            </button>
          </div>
 
        </div>
      </section>
        </>
    )
}

export default Testimonials