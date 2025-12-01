import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ user }) {
  if (!user) return null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        background: "rgba(40, 40, 55, 0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* LOGO */}
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <img
          src="/logo.svg"
          alt="logo"
          style={{ width: 38, height: 38, marginRight: 10, opacity: 0.95 }}
        />
        <span style={{ fontSize: 20, fontWeight: 600, color: "white" }}>StudentNet</span>
      </Link>

      {/* USER + LOGOUT */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "white", opacity: 0.8 }}>{user.email}</span>

        <button
          onClick={() => signOut(auth)}
          style={{
            background: "rgba(140, 120, 255, 0.3)",
            border: "1px solid rgba(160, 140, 255, 0.6)",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer",
            color: "white",
            transition: "0.2s",
          }}
        >
          Logout
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

export default Header;