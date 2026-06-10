import React from 'react'
import './LoginRegister.css'
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  setupRecaptcha,
  signInWithPhoneNumber
} from "../firebase";



export default function LoginRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    register,
    googleLogin,
    isLoggedIn,
    user
  } = useAuth();

  // If already logged in → redirect based on role
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === "admin") {
        navigate("/admin-profile");
      } else if (user.role === "provider") {
        navigate("/provider-profile");
      } else {
        navigate("/profile");
      }
    }
  }, [isLoggedIn, user, navigate]);

  // Start on register tab if URL is /register
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmObj, setConfirmObj] = useState(null);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      const appVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("OTP Sent");
    } catch (err) {
      console.log(err);
      alert("OTP Failed");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      const otpUser = {
        name: result.user.phoneNumber,
        phone: result.user.phoneNumber,
        email: "",
        avatar: "",
        role: "user",
      };
      localStorage.setItem("user", JSON.stringify(otpUser));
      localStorage.setItem("token", result.user.uid);
      alert("Login Success");
      setPhone("");
      setOtp("");
      window.confirmationResult = null;
      if (otpUser.role === "provider") {
        navigate("/provider-profile");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
      alert("Invalid OTP");
    }
  };

  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register" && !form.name) { setError("Name is required."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(form.email, form.password);

        console.log("LOGIN USER =", data.user);
        console.log("ROLE =", data.user.role);

        if (data.user.role === "admin") {
          console.log("GOING TO ADMIN");
          navigate("/admin-profile");
        } else if (data.user.role === "provider") {
          navigate("/provider-profile");
        } else {
          navigate("/profile");
        }
      } else {
        const data = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: form.role,
          ...(form.role === "provider" && { category: "Home Cleaning", hourlyRate: 0 }),
        });
        setSuccess(`Account created! Welcome, ${data.user.name}!`);
        setTimeout(() => {
          if (data.user.role === "provider") navigate("/join-provider");
          // else will redirect via useEffect
        }, 1000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = {
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        role: "user",
      };
      googleLogin(gUser);
      alert("Google Login Success");
      if (gUser.role === "provider") {
        navigate("/provider-profile");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
      alert("Google Login Failed");
    }
  };

  const switchMode = (m) => {
    setMode(m); setError(""); setSuccess("");
    navigate(m === "login" ? "/login" : "/register", { replace: true });
  };

  return (
    <>
      <div className="auth-wrap">
        {/* Left panel */}
        <div className="auth-left">
          <div className="left-grid" /><div className="lb lb1" /><div className="lb lb2" />
          <div className="logo">
            <div className="logo-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <span className="logo-text">Serve<span>Now</span></span>
          </div>
          <div className="left-main">
            <div className="l-tag"><span className="l-tag-dot" />Trusted by 10,000+ customers</div>
            <h2 className="l-h">Book Local<br /><span className="o">Services,</span><br />Instantly</h2>
            <p className="l-p">Verified professionals, transparent pricing, on-time guarantee.</p>
            <div className="feats">
              {[["🛡️", "rgba(16,185,129,.15)", "100% Verified", "ID & skill checked"], ["💰", "rgba(245,158,11,.15)", "Transparent Pricing", "Full price shown upfront"], ["⚡", "rgba(74,144,226,.15)", "Instant Booking", "Confirm in 2 minutes"]].map(([ic, bg, t, s], i) => (
                <div className="feat" key={i}><div className="feat-ic" style={{ background: bg }}>{ic}</div><div><div className="ft">{t}</div><div className="fs">{s}</div></div></div>
              ))}
            </div>
          </div>
          <div className="stats">
            {[["500+", "Providers"], ["10K+", "Bookings"], ["4.8★", "Rating"]].map(([v, l], i, a) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div className="stat"><div className="sv">{v}</div><div className="sl">{l}</div></div>
                {i < a.length - 1 && <div className="sdiv" />}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className={`card ${show ? "show" : ""}`}>
            <div className="tabs">
              {["login", "register"].map(m => (
                <button key={m} className={`tab ${mode === m ? "on" : ""}`} onClick={() => switchMode(m)}>
                  {m === "login" ? "Log In" : "Create Account"}
                </button>
              ))}
            </div>
            <div><div className="ch">{mode === "login" ? "Welcome back 👋" : "Join ServeNow 🚀"}</div><div className="cs" style={{ marginTop: 4 }}>{mode === "login" ? "Enter your credentials to continue." : "Create your free account in under a minute."}</div></div>

            {mode === "register" && null}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mode === "register" && (
                <div className="frow">
                  <div className="fg"><label className="fl">Full Name</label><input className="fi" placeholder="Muhammed Faizal F" value={form.name} onChange={e => u("name", e.target.value)} /></div>
                  <div className="fg"><label className="fl">Phone</label><input className="fi" placeholder="9876543210" value={form.phone} onChange={e => u("phone", e.target.value)} /></div>
                </div>
              )}
              <div className="fg"><label className="fl">Email Address</label><input className="fi" type="email" placeholder="you@example.com" value={form.email} onChange={e => u("email", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
              <div className="fg">
                <label className="fl">Password</label>

                <div className="password-wrapper">
                  <input
                    className="fi"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => u("password", e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />

                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
            </div>

            {error && <div className="alert ae">⚠ {error}</div>}
            {success && <div className="alert ao">✓ {success}</div>}

            <button className="btn-sub" onClick={handleSubmit} disabled={loading}>
              {loading ? <><div className="spin" />{mode === "login" ? "Signing in…" : "Creating…"}</>
                : <>{mode === "login" ? "Sign In" : "Create Account"} <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
            </button>

            <div className="div-row"><div className="div-line" /><span className="div-t">or continue with</span><div className="div-line" /></div>
            <div className="social-auth">
              <button className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="google" />
                Continue with Google
              </button>

              <div className="otp-box">
                {!showPhoneAuth ? (
                  <button className="phone-btn" onClick={() => setShowPhoneAuth(true)}>
                    📱 Continue with Phone OTP
                  </button>
                ) : (
                  <div className="otp-box show">
                    <input type="text" placeholder="+91 Enter phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <button onClick={sendOtp}>Send OTP</button>
                    {otpSent && (
                      <>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <button onClick={verifyOtp}>Verify OTP</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="foot">
              {mode === "login" ? <>No account? <span onClick={() => switchMode("register")}>Sign up free</span></> : <>Have an account? <span onClick={() => switchMode("login")}>Sign in</span></>}
            </div>
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </>
  );
}