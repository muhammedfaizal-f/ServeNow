import React from 'react'
import { useState } from 'react'
import './Footer.css'

const footerLinks = [
  {
    heading: "Company",
    links: ["About Us", "Careers", "Blog", "Press", "Contact Us"],
  },
  {
    heading: "Services",
    links: ["All Categories", "Plumbing", "Electrician", "Cleaning", "AC Repair", "Carpentry"],
  },
  {
    heading: "For Providers",
    links: ["Join as Provider", "Provider Dashboard", "Pricing & Earnings", "Provider Guidelines", "Support"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Use", "Cookie Policy", "Refund Policy"],
  },
];
 
const socialLinks = [
  {
    label: "Instagram",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    color: "#1DA1F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
];
 
const cities = ["Coimbatore", "Chennai", "Madurai", "Trichy", "Salem", "Erode", "Tiruppur", "Vellore"];
 
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
 
  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3500);
    }
  };
  return (
   <>
   <footer className="ft-root">
        <div className="ft-blob ft-blob-1" />
        <div className="ft-blob ft-blob-2" />
 
        {/* Newsletter strip */}
        <div className="ft-newsletter">
          <div className="ft-newsletter-inner">
            <div className="ft-nl-left">
              <div className="ft-nl-title">Stay in the loop 📬</div>
              <div className="ft-nl-sub">Get service tips, offers & updates straight to your inbox.</div>
            </div>
            <div className="ft-nl-form">
              <input
                className="ft-nl-input"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
              />
              <button
                className={`ft-nl-btn ${subscribed ? "done" : ""}`}
                onClick={handleSubscribe}
              >
                {subscribed ? (
                  <>
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Subscribed!
                  </>
                ) : (
                  "Subscribe →"
                )}
              </button>
            </div>
          </div>
        </div>
 
        {/* Main body */}
        <div className="ft-body">
 
          {/* Brand */}
          <div className="ft-brand">
            <div className="ft-logo">
              <div className="ft-logo-icon">
                <svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="ft-logo-text">Serve<span>Now</span></span>
            </div>
 
            <p className="ft-tagline">
              Your trusted platform for on-demand local services. Verified professionals, transparent pricing, instant booking.
            </p>
 
            {/* Socials */}
            <div className="ft-socials">
              {socialLinks.map((s, i) => (
                <div
                  key={i}
                  className="ft-social-btn"
                  title={s.label}
                  onMouseEnter={() => setHoveredSocial(i)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  style={hoveredSocial === i ? {
                    background: `${s.color}18`,
                    borderColor: `${s.color}35`,
                    color: s.color,
                  } : {}}
                >
                  {s.icon}
                </div>
              ))}
            </div>
 
            {/* Contact */}
            <div className="ft-contact">
              <div className="ft-contact-row">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.8 19.79 19.79 0 01.06 2.22a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                +91 98765 43210
              </div>
              <div className="ft-contact-row">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                hello@servenow.in
              </div>
              <div className="ft-contact-row">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Coimbatore, Tamil Nadu
              </div>
            </div>
          </div>
 
          {/* Link columns */}
          {footerLinks.map((col, i) => (
            <div className="ft-col" key={i}>
              <div className="ft-col-heading">{col.heading}</div>
              <div className="ft-col-links">
                {col.links.map((link, j) => {
                  const key = `${i}-${j}`;
                  return (
                    <div
                      key={j}
                      className="ft-link"
                      onMouseEnter={() => setHoveredLink(key)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      {link}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
 
        {/* Cities */}
        <div className="ft-cities">
          <div className="ft-cities-label">Available cities</div>
          <div className="ft-cities-row">
            {cities.map((c, i) => (
              <div className="ft-city-chip" key={i}>{c}</div>
            ))}
            <div className="ft-city-chip" style={{ borderStyle: "dashed" }}>+ More coming soon</div>
          </div>
        </div>
 
        {/* Bottom bar */}
        <div className="ft-bottom">
          <div className="ft-bottom-inner">
            <div className="ft-copy">
              © 2026 <span>ServeNow</span>. All rights reserved.
            </div>
            <div className="ft-bottom-links">
              {["Privacy Policy", "Terms of Use", "Cookie Policy", "Sitemap"].map((l, i) => (
                <span className="ft-bottom-link" key={i}>{l}</span>
              ))}
            </div>
            <div className="ft-made">
              Made with <span>♥</span> in Coimbatore, India
            </div>
          </div>
        </div>
 
      </footer>
   </>
  )
}

export default Footer