import React from "react";
import { Link } from "react-router-dom";
import { auth, signOut } from "../firebase";
import "./Header.css";

export default function Header({ user }) {
  if (!user) return null;

  return (
    <header className="app-header">
      <Link to="/" className="header-logo">
        <img src="/logo.svg" alt="logo" />
        <span>StudentNet</span>
      </Link>

      <div className="header-right">
        <span>{user.email}</span>
        <button className="header-logout" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>
    </header>
  );
}