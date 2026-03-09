import React, { useState, useEffect } from "react";
import HallwayLogo from "../HallwayLogo";
import { useTheme } from "../../themeStore";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FaHome, FaUser, FaComments, FaCog, FaMoon, FaSun, FaTimes, FaCircle, FaEnvelope } from "react-icons/fa";

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
            <HallwayLogo size={32} />
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
          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaEnvelope className="nav-icon" />
            {open && <span>Messages</span>}
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