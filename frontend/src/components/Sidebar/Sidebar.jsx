import React, { useState, useEffect } from "react";
import { useTheme } from "../../themeStore";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FaHome, FaUser, FaComments, FaCog, FaMoon, FaSun, FaTimes, FaCircle } from "react-icons/fa";

export default function Sidebar({ open, setOpen, user }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {isMobile && open && (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      )}

      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" width="30" height="30">
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M10 10 L50 40 L90 10" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M10 90 L50 60 L90 90" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="40" y="40" width="20" height="30" fill="currentColor" opacity="0.8" />
                <circle cx="50" cy="5" r="3" fill="#fbbf24" />
              </svg>
            </div>
            {open && <span className="logo-text">HallWay</span>}
          </div>
          {isMobile && (
            <button className="close-sidebar" onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaHome className="nav-icon" />
            {open && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/boards" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaComments className="nav-icon" />
            {open && <span>Boards</span>}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaUser className="nav-icon" />
            {open && <span>Profile</span>}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaCog className="nav-icon" />
            {open && <span>Settings</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
            {open && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {open && user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.photoURL ? <img src={user.photoURL} alt="" /> : user.email[0].toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.displayName || user.email.split('@')[0]}</span>
                <span className="user-status"><FaCircle style={{ fontSize: 8, color: '#10b981', marginRight: 4 }} /> Online</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}