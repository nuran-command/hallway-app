import React, { useState, useEffect } from "react";
import { useTheme } from "../../themeStore";
import "./Sidebar.css";

export default function Sidebar({ open, setOpen }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!open && !isMobile) return (
    <button 
      className="sidebar-toggle-global"
      onClick={() => setOpen(true)}
    >
      ☰
    </button>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      )}

      <aside className={`sidebar ${open ? "open" : "closed"} ${isMobile ? "mobile" : ""}`}>
        <div className="sidebar-header">
          <img src="/logo192.png" alt="Logo" className="sidebar-logo" />
          <button 
            className="toggle-btn" 
            onClick={() => setOpen(!open)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>

        {open && (
          <div className="sidebar-content">
            <div className="sidebar-avatar">👤</div>
            <p>Profile</p>
            <p>Friends</p>
            <p>Settings</p>

            <button onClick={toggleTheme}>
              Switch Theme ({theme})
            </button>
          </div>
        )}
      </aside>
    </>
  );
}