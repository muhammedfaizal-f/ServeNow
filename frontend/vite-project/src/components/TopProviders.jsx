import React from 'react'
import { useState } from 'react'
import './TopProviders.css'
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const providers = [
    {
        _id: "1",
        name: "Ravi Kumar",
        role: "Master Plumber",
        location: "Gandhipuram, Coimbatore",
        rating: 4.9,
        reviews: 312,
        jobs: "800+",
        price: "₹299/hr",
        badge: "Top Rated",
        badgeColor: "#F59E0B",
        available: true,
        avatar: "RK",
        avatarBg: "#1e3a5f",
        avatarColor: "#4A90E2",
        skills: ["Pipe Repair", "Leak Fix", "Tap Install"],
        color: "#4A90E2",
        responseTime: "~10 mins",
    },
    {
        _id: "2",
        name: "Suresh M.",
        role: "Senior Electrician",
        location: "RS Puram, Coimbatore",
        rating: 4.8,
        reviews: 245,
        jobs: "600+",
        price: "₹350/hr",
        badge: "Pro Verified",
        badgeColor: "#10B981",
        available: true,
        avatar: "SM",
        avatarBg: "#0a2e18",
        avatarColor: "#10B981",
        skills: ["Wiring", "Fan Fitting", "Inverter"],
        color: "#10B981",
        responseTime: "~15 mins",
    },
    {
        _id: "3",
        name: "Meena S.",
        role: "Deep Cleaning Expert",
        location: "Saibaba Colony, CBE",
        rating: 5.0,
        reviews: 189,
        jobs: "420+",
        price: "₹199/hr",
        badge: "⭐ Perfect Score",
        badgeColor: "#A78BFA",
        available: true,
        avatar: "MS",
        avatarBg: "#1e0f3d",
        avatarColor: "#A78BFA",
        skills: ["Deep Clean", "Kitchen", "Bathroom"],
        color: "#A78BFA",
        responseTime: "~5 mins",
    },
    {
        _id: "4",
        name: "Arjun D.",
        role: "AC & Appliance Tech",
        location: "Peelamedu, Coimbatore",
        rating: 4.7,
        reviews: 178,
        jobs: "390+",
        price: "₹450/hr",
        badge: "Fast Response",
        badgeColor: "#06B6D4",
        available: false,
        avatar: "AD",
        avatarBg: "#052030",
        avatarColor: "#06B6D4",
        skills: ["AC Service", "Gas Refill", "Deep Clean"],
        color: "#06B6D4",
        responseTime: "~20 mins",
    },
    {
        _id: "5",
        name: "Priya R.",
        role: "Home Tutor",
        location: "Peelamedu, Coimbatore",
        rating: 4.9,
        reviews: 401,
        jobs: "1.2K+",
        price: "₹250/hr",
        badge: "Most Booked",
        badgeColor: "#FF6B35",
        available: true,
        avatar: "PR",
        avatarBg: "#3d1500",
        avatarColor: "#FF6B35",
        skills: ["Maths", "Science", "English"],
        color: "#FF6B35",
        responseTime: "~8 mins",
    },
    {
        _id: "6",
        name: "Karthik V.",
        role: "Carpenter & Fabricator",
        location: "Saravanampatti, CBE",
        rating: 4.6,
        reviews: 134,
        jobs: "280+",
        price: "₹380/hr",
        badge: "New & Rising",
        badgeColor: "#FB7185",
        available: true,
        avatar: "KV",
        avatarBg: "#3b0a17",
        avatarColor: "#FB7185",
        skills: ["Furniture Fix", "Custom Shelf", "Modular"],
        color: "#FB7185",
        responseTime: "~25 mins",
    },
];

const categories = ["All", "Plumbing", "Electrical", "Cleaning", "AC Repair", "Tutoring", "Carpentry"];

const StarRating = ({ rating, color }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
            {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" width="12" height="12"
                    fill={i < full ? color : (i === full && half ? "url(#half)" : "none")}
                    stroke={i < full || (i === full && half) ? color : "rgba(255,255,255,0.2)"}
                    strokeWidth="1.5">
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor={color} />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </span>
    );
};

const TopProviders = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");
    const [hovered, setHovered] = useState(null);
    const [booked, setBooked] = useState(null);

    const handleBook = (i) => {
        setBooked(i);
        setTimeout(() => setBooked(null), 2000);
    };


    return (
        <>
            <section className="tp-root">
                <div className="tp-blob tp-blob-1" />
                <div className="tp-blob tp-blob-2" />

                <div className="tp-inner">

                    {/* Header */}
                    <div className="tp-header">
                        <div>
                            <div className="tp-eyebrow">
                                <div className="tp-eyebrow-line" />
                                <span className="tp-eyebrow-text">Top professionals</span>
                            </div>
                            <h2 className="tp-title">Meet Our <span>Top-Rated</span><br />Local Experts</h2>
                            <p className="tp-subtitle">Real professionals. Real reviews. Real results.</p>
                        </div>
                        <div className="tp-header-right">
                            <div className="tp-live">
                                <span className="tp-live-dot" />
                                <span>486 providers active right now</span>
                            </div>
                            <Link to="/providers" className='pro'>
                                <button className="tp-view-all">
                                    View all providers
                                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="tp-filters">
                        {categories.map((c, i) => (
                            <button
                                key={i}
                                className={`tp-filter ${activeCategory === c ? "active" : ""}`}
                                onClick={() => setActiveCategory(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="tp-grid">
                        {providers.map((p, i) => (
                            <div
                                key={i}
                                className={`prov-card ${hovered === i ? "hov" : ""}`}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    borderColor: hovered === i ? `${p.color}28` : undefined,
                                }}
                            >
                                {/* Banner */}
                                <div className="prov-banner">
                                    <div
                                        className="prov-banner-inner"
                                        style={{
                                            background: `linear-gradient(135deg, ${p.color} 0%, ${p.avatarBg} 100%)`,
                                        }}
                                    />
                                    {/* availability */}
                                    <div
                                        className="prov-avail"
                                        style={{
                                            background: p.available ? "rgba(16,185,129,0.15)" : "rgba(100,100,100,0.15)",
                                            color: p.available ? "#34D399" : "rgba(255,255,255,0.35)",
                                            border: `0.5px solid ${p.available ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
                                        }}
                                    >
                                        <span
                                            className="prov-avail-dot"
                                            style={{ background: p.available ? "#10B981" : "#6B7280" }}
                                        />
                                        {p.available ? "Available Now" : "Busy"}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="prov-body">

                                    {/* Avatar + badge row */}
                                    <div className="prov-top-row">
                                        <div
                                            className="prov-avatar"
                                            style={{ background: p.avatarBg, color: p.avatarColor }}
                                        >
                                            {p.avatar}
                                        </div>
                                        <div
                                            className="prov-badge"
                                            style={{
                                                background: `${p.badgeColor}18`,
                                                color: p.badgeColor,
                                                border: `0.5px solid ${p.badgeColor}30`,
                                            }}
                                        >
                                            {p.badge}
                                        </div>
                                    </div>

                                    {/* Name & info */}
                                    <div>
                                        <div className="prov-name">{p.name}</div>
                                        <div className="prov-role">{p.role}</div>
                                        <div className="prov-location">
                                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            {p.location}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="prov-rating-row">
                                        <StarRating rating={p.rating} color={p.color} />
                                        <span className="prov-rating-num">{p.rating}</span>
                                        <span className="prov-dot">·</span>
                                        <span className="prov-reviews">{p.reviews} reviews</span>
                                    </div>

                                    {/* Skills */}
                                    <div className="prov-skills">
                                        {p.skills.map((s, j) => (
                                            <span
                                                key={j}
                                                className="prov-skill"
                                                style={{
                                                    color: p.color,
                                                    borderColor: `${p.color}28`,
                                                    background: `${p.color}0e`,
                                                }}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="prov-meta">
                                        <div className="prov-meta-item">
                                            <span className="prov-meta-val">{p.jobs}</span>
                                            <span className="prov-meta-label">Jobs Done</span>
                                        </div>
                                        <div className="prov-meta-divider" />
                                        <div className="prov-meta-item">
                                            <span className="prov-meta-val">{p.price}</span>
                                            <span className="prov-meta-label">Starting</span>
                                        </div>
                                        <div className="prov-meta-divider" />
                                        <div className="prov-meta-item">
                                            <span className="prov-meta-val" style={{ color: p.color }}>{p.rating}★</span>
                                            <span className="prov-meta-label">Rating</span>
                                        </div>
                                    </div>

                                    {/* Response time */}
                                    <div className="prov-response">
                                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        Avg. response time: {p.responseTime}
                                    </div>

                                    {/* Actions */}
                                    <div className="prov-actions">
                                        <button className="btn-chat" title="Message provider">
                                            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                        </button>

                                        <button

                                            type="button"
                                            className={`btn-book-prov ${booked === i ? "confirmed" : ""}`}
                                            onClick={() => {
                                                handleBook(i);

                                                navigate(`/book/${p._id}`, {
                                                    state: {
                                                        provider: p
                                                    }
                                                });
                                            }}
                                            style={{
                                                background: booked === i ? undefined : p.color,
                                                color: "white",
                                            }}
                                        >
                                            {booked === i ? (
                                                <>
                                                    Booking Sent!
                                                </>
                                            ) : (
                                                <>
                                                    Book Now · {p.price}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="tp-bottom">
                        <div className="tp-bottom-left">
                            <div className="tp-bottom-title">Are you a skilled professional?</div>
                            <div className="tp-bottom-sub">Join 500+ providers earning on ServeNow. Set your own hours & rates.</div>
                        </div>
                        <div className="tp-bottom-btns">
                            <Link to={"/join-provider"} className='join'>
                                <button className="btn-provider-join">
                                    Join as Provider →
                                </button>
                            </Link>
                            <Link to={"/providers"} className='explore'>
                                <button className="btn-explore-all">
                                    Explore All Providers
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default TopProviders