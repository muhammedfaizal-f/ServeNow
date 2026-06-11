// src/components/ProtectedRoute.jsx
// ─── Wrap any page that needs login with this component ──────────────────────
// Redirects to /login if user is not logged in
// Redirects to / if user doesn't have the required role

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage:
// <ProtectedRoute>               → any logged-in user
// <ProtectedRoute role="provider"> → provider only
// <ProtectedRoute role="admin">    → admin only

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isLoggedIn } = useAuth();

  // Still loading from localStorage — show nothing
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080F2A",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,.4)", fontFamily: "DM Sans, sans-serif",
      }}>
        Loading…
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}