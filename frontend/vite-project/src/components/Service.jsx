import React from 'react'
import { useState } from 'react'
import './Service.css'


  const categories = [
  {
    icon: "🔧",
    title: "Plumbing",
    desc: "Pipe repairs, leaks & installations",
    count: "48 providers",
    color: "#3B82F6",
    bg: "#1e3a5f",
    services: ["Pipe Repair", "Leak Fix", "Tap Install", "Drainage"],
  },
  {
    icon: "⚡",
    title: "Electrician",
    desc: "Wiring, fuse box & fan fitting",
    count: "62 providers",
    color: "#F59E0B",
    bg: "#3d2a00",
    services: ["Wiring", "Fan Fitting", "Switchboard", "Inverter"],
  },
  {
    icon: "🧹",
    title: "Home Cleaning",
    desc: "Deep clean & regular maintenance",
    count: "75 providers",
    color: "#10B981",
    bg: "#0a3325",
    services: ["Deep Clean", "Bathroom", "Kitchen", "Move-in Clean"],
  },
  {
    icon: "🎨",
    title: "Painting",
    desc: "Interior & exterior wall painting",
    count: "34 providers",
    color: "#EC4899",
    bg: "#3b0a26",
    services: ["Interior", "Exterior", "Texture", "Waterproofing"],
  },
  {
    icon: "❄️",
    title: "AC Repair",
    desc: "Service, gas refill & cleaning",
    count: "41 providers",
    color: "#06B6D4",
    bg: "#062a35",
    services: ["AC Service", "Gas Refill", "Installation", "Deep Clean"],
  },
  {
    icon: "🛠",
    title: "Carpentry",
    desc: "Furniture fix & custom shelves",
    count: "29 providers",
    color: "#F97316",
    bg: "#3d1a00",
    services: ["Furniture Fix", "Custom Shelf", "Door Repair", "Modular"],
  },
  {
    icon: "📚",
    title: "Tutoring",
    desc: "Home tutor for all subjects",
    count: "93 providers",
    color: "#A78BFA",
    bg: "#2a1a4a",
    services: ["Maths", "Science", "English", "Competitive"],
  },
  {
    icon: "🐾",
    title: "Pet Care",
    desc: "Dog walking & grooming",
    count: "22 providers",
    color: "#FB7185",
    bg: "#3b0a17",
    services: ["Dog Walk", "Grooming", "Pet Sitting", "Vet Visit"],
  },
  {
    icon: "🪴",
    title: "Gardening",
    desc: "Lawn care & plant trimming",
    count: "18 providers",
    color: "#4ADE80",
    bg: "#0a2e12",
    services: ["Lawn Mow", "Trimming", "Planting", "Pest Control"],
  },
  {
    icon: "📦",
    title: "Moving Help",
    desc: "Packing, loading & delivery",
    count: "37 providers",
    color: "#FCD34D",
    bg: "#332800",
    services: ["Packing", "Loading", "Transport", "Unpacking"],
  },
  {
    icon: "🔑",
    title: "Locksmith",
    desc: "Lock repair, key cutting & more",
    count: "15 providers",
    color: "#94A3B8",
    bg: "#1e2533",
    services: ["Lock Repair", "Key Cut", "Smart Lock", "Safe Open"],
  },
  {
    icon: "🍳",
    title: "Home Cook",
    desc: "Daily cooking & event catering",
    count: "56 providers",
    color: "#FF6B35",
    bg: "#3d1500",
    services: ["Daily Cook", "Tiffin", "Party Cook", "Diet Meals"],
  },
];
 
const filters = ["All", "Home", "Repair", "Personal", "Care"];
 
const ServiceCategories = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  return (
    <>
    <section className="sc-root">
        <div className="sc-blob" />
 
        <div className="sc-inner">
 
          {/* Header */}
          <div className="sc-header">
            <div>
              <div className="sc-eyebrow">
                <div className="sc-eyebrow-line" />
                <span className="sc-eyebrow-text">What we offer</span>
              </div>
              <h2 className="sc-title">Browse Popular<br /><span>Services</span></h2>
              <p className="sc-subtitle">Find the right professional for every home and personal need.</p>
            </div>
            <button className="sc-view-all">
              View all services
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
 
          {/* Filters */}
          <div className="sc-filters">
            {filters.map((f, i) => (
              <button
                key={i}
                className={`filter-pill ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
 
          {/* Grid */}
          <div className="sc-grid">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`cat-card ${hoveredCard === i ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  "--card-color": cat.color,
                  background: hoveredCard === i
                    ? `linear-gradient(135deg, ${cat.bg} 0%, rgba(255,255,255,0.02) 100%)`
                    : undefined,
                  borderColor: hoveredCard === i ? `${cat.color}33` : undefined,
                }}
              >
                {/* glow overlay */}
                <div
                  style={{
                    position: "absolute", inset: 0, borderRadius: 18,
                    background: `radial-gradient(circle at 20% 20%, ${cat.color}10 0%, transparent 60%)`,
                    opacity: hoveredCard === i ? 1 : 0,
                    transition: "opacity 0.3s",
                    pointerEvents: "none",
                  }}
                />
 
                <div className="cat-top">
                  <div
                    className="cat-icon-wrap"
                    style={{ background: `${cat.color}18`, border: `0.5px solid ${cat.color}30` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="cat-arrow">
                    <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  </div>
                </div>
 
                <div>
                  <div className="cat-title">{cat.title}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </div>
 
                <div className="cat-tags">
                  {cat.services.map((s, j) => (
                    <span
                      key={j}
                      className="cat-tag"
                      style={{
                        color: cat.color,
                        borderColor: `${cat.color}30`,
                        background: `${cat.color}10`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
 
                <div className="cat-bottom">
                  <span className="cat-count">
                    <span className="cat-count-dot" />
                    {cat.count}
                  </span>
                  <button
                    className="cat-book-btn"
                    style={{
                      background: cat.color,
                      color: "#fff",
                    }}
                  >
                    Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
 
          {/* Bottom strip */}
          <div className="sc-bottom">
            <span className="sc-bottom-text">Can't find what you need?</span>
            <div className="sc-bottom-chips">
              {["Request a Custom Service", "Become a Provider", "View All 20+ Categories"].map((t, i) => (
                <span className="bottom-chip" key={i}>{t}</span>
              ))}
            </div>
          </div>
 
        </div>
      </section>
    </>
  )
}

export default ServiceCategories