import React from 'react'
import { useState, useEffect } from "react";
import './Home.css'
import { useNavigate } from "react-router-dom";



// On search button click:

const home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Coimbatore");
  const [activeCategory, setActiveCategory] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const quickCategories = [
    { icon: "🔧", label: "Plumbing" },
    { icon: "⚡", label: "Electrician" },
    { icon: "🧹", label: "Cleaning" },
    { icon: "🎨", label: "Painting" },
    { icon: "❄️", label: "AC Repair" },
    { icon: "🛠", label: "Carpentry" },
  ];

  const cities = [
    "Coimbatore",
    "Chennai",
    "Madurai",
    "Trichy",
    "Salem",
    "Erode",
    "Tiruppur",
    "Vellore"
  ];

  const stats = [
    { value: "500+", label: "Verified Providers" },
    { value: "10K+", label: "Bookings Done" },
    { value: "4.8★", label: "Average Rating" },
    { value: "20+", label: "Categories" },
  ];

  const floatingCards = [
    { icon: "✅", title: "Booking Confirmed!", sub: "Plumber · Today 3:00 PM", color: "#1DB954" },
    { icon: "⭐", title: "Ravi Kumar", sub: "4.9 · Electrician · ₹350/hr", color: "#FF6B35" },
    { icon: "🔔", title: "Provider on the way", sub: "Arrives in ~12 mins", color: "#4A90E2" },
  ];

  return (
    <>
      <section className="hero-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-bg" />

        <div className="hero-inner">
          {/* LEFT */}
          <div className="hero-left">

            <div className={`hero-badge ${visible ? "show" : ""}`}>
              <span className="badge-dot" />
              500+ Verified Professionals Near You
            </div>

            <h1 className={`hero-title ${visible ? "show" : ""}`}>
              Your Trusted<br />
              <span className="line-orange">Local Services,</span><br />
              <span className="line-dim">Booked in Minutes.</span>
            </h1>

            <p className={`hero-sub ${visible ? "show" : ""}`}>
              From plumbing to cleaning, electricians to tutors — find verified
              local professionals and book them instantly from your phone.
            </p>

            {/* Search */}
            <div className={`search-box ${visible ? "show" : ""}`}>
              <div className="search-field">
                <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);

                    // remove active category while typing
                    setActiveCategory(null);
                  }}
                />
              </div>

              <div className="search-divider" />
              <div className="search-field" style={{ flex: "0 0 160px" }}>
                <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    width: "100%",
                    outline: "none",
                    fontSize: "15px"
                  }}
                >
                  <option value="">Select City</option>

                  {cities.map((city, index) => (
                    <option
                      key={index}
                      value={city}
                      style={{
                        background: "#0b1020",
                        color: "white"
                      }}
                    >
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-search"
                onClick={() =>
                  navigate(
                    `/search?q=${encodeURIComponent(search)}&city=${encodeURIComponent(location)}`
                  )
                }
              ><svg viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                Search</button>
            </div>

            {/* Quick Categories */}
            <div className={`quick-cats ${visible ? "show" : ""}`}>
              <span className="quick-label">Popular:</span>
              {quickCategories.map((c, i) => (
                <button
                  key={i}
                  className={`cat-chip ${activeCategory === i ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(i === activeCategory ? null : i);
                    setSearch(c.label);
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className={`stats-row ${visible ? "show" : ""}`}>
              {stats.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "28px", alignItems: "center" }}>
                  <div className="stat-item">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  {i < stats.length - 1 && <div className="stat-divider" />}
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT — Visual */}
          <div className={`hero-right ${visible ? "show" : ""}`}>

            {/* Floating notification cards */}
            {floatingCards.map((fc, i) => (
              <div key={i} className={`float-card fc-${i + 1}`}>
                <div className="fc-icon" style={{ background: `${fc.color}22` }}>
                  <span style={{ fontSize: "18px" }}>{fc.icon}</span>
                </div>
                <div>
                  <div className="fc-title">{fc.title}</div>
                  <div className="fc-sub">{fc.sub}</div>
                </div>
              </div>
            ))}

            {/* Main card */}
            <div className="illus-card">
              <div className="illus-map">
                <div className="map-grid" />
                <div className="map-pin p1" />
                <div className="map-pin p2" />
                <div className="map-pin p3" />
                <div className="map-label">
                  <strong>3 providers nearby</strong>
                  Coimbatore, TN
                </div>
              </div>

              <div className="illus-title">Available Now</div>
              <div className="illus-sub">Verified professionals near you</div>

              <div className="provider-list">
                {[
                  { avatar: "🔧", name: "Ravi Kumar", meta: "Plumber · 1.2 km away", price: "₹299/hr", bg: "#FF6B3522" },
                  { avatar: "⚡", name: "Suresh M.", meta: "Electrician · 0.8 km", price: "₹350/hr", bg: "#4A90E222" },
                  { avatar: "🧹", name: "Meena S.", meta: "Cleaning · 2.1 km", price: "₹199/hr", bg: "#1DB95422" },
                ].map((p, i) => (
                  <div className="provider-row" key={i}>
                    <div className="p-avatar" style={{ background: p.bg }}>
                      {p.avatar}
                    </div>
                    <div className="p-info">
                      <div className="p-name">{p.name}</div>
                      <div className="p-meta">{p.meta}</div>
                    </div>
                    <div className="p-price">{p.price}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  )
}

export default home