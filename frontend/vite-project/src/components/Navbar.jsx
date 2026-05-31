import React from 'react'
import './Navbar.css'
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const { user, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Home", "Services", "How It Works", "About"];



  return (
    <>

      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="logo-text">Serve<span>Now</span></span>
        </div>

        {/* Desktop Nav Links */}
        <ul className="nav-links">

          {/* Home */}
          <li>
            <a href="#home">Home</a>
          </li>

          <li>
            <Link to="/providers" className="nav-link-item">
              Services
            </Link>
          </li>

          <li>
            <a href="#howitworks">How It Works</a>


          </li>

          <li>
           <a href="#whychooseus">About</a>
          </li>

        </ul>

        {/* Desktop Right Buttons */}
        <div className="nav-right">

          {isLoggedIn ? (
            <div className="profile-menu">
              <Link to="/profile" className="profile-link">

                <div className="profile-avatar">

                  <img
                    src={user?.avatar || "/profile-picture.png"}
                    alt="profile"
                    className="profile-img"
                  />

                </div>

              </Link>


            </div>
          ) : (
            <Link to={"/login"}>
              <button className="btn-login">Log In</button>
            </Link>
          )}
          <Link to={"/providers"} className='link'>
            <button className="btn-book">
              <svg viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Book Now
            </button>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link, i) => (
          <a key={i} href="#" onClick={() => setMenuOpen(false)}>{link}</a>
        ))}
        <div className="mobile-menu-divider" />
        <button className="btn-book" onClick={() => setMenuOpen(false)}>
          Book a Service
        </button>
      </div>

      {/* Demo background so navbar is visible */}
      {/* <div className="demo-hero">
        <div className="demo-badge">
          <span className="badge-dot" /> v1.0.6 Live — Now in tamilnadu, India</div>
        <h1 className="demo-title">Your Local Services,<br /><span>Booked in Minutes</span></h1>
        <p className="demo-sub">Book verified local experts for all your home service needs — quick, affordable, and hassle-free.</p>
        {/*  <span className="demo-note">↑ SECTION 1 — NAVBAR COMPONENT</span> */}
      {/* </div> */}

      {/* Scroll space for demo */}
      {/* <div style={{ height: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#8A94A6", fontSize: "14px" }}>
          Scroll back up to see the navbar in glass mode ↑
        </p>
      </div> */}

    </>
  )
}

export default Navbar