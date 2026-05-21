// src/context/AuthContext.jsx
// ─── Global auth state — wrap your entire app with this ───────────────────────
// Any component can call useAuth() to get user info or login/logout

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true on first load

  // ── On app start: restore user from localStorage ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user",  JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const res = await authAPI.register(formData);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user",  JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  // ── Update user in context after profile edit ─────────────────────────────
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isLoggedIn  = !!user;
  const isProvider  = user?.role === "provider";
  const isAdmin     = user?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user, loading,
      isLoggedIn, isProvider, isAdmin,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook: use this in any component ────────────────────────────────────
// Example: const { user, login, logout, isLoggedIn } = useAuth();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};