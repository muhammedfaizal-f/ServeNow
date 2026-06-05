// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#060D25"
      }}>
        <div className="spinner" style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255,255,255,.1)",
          borderTopColor: "#FF6B35",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    // Redirect providers to their dashboard, users to profile
    if (user?.role === "provider") {
      return <Navigate to="/provider-profile" replace />;
    }
    return <Navigate to="/profile" replace />;
  }

  return children;
}