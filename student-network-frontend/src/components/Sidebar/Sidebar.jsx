import React, { useState } from 'react';
import { useTheme } from '../../themeStore';
import './Sidebar.css'; // отдельный css для анимаций Sidebar

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <img src="/logo192.png" alt="Logo" className="sidebar-logo" />
        <button onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="sidebar-content">
          <div className="sidebar-avatar">👤</div>
          <p>Profile</p>
          <p>Friends</p>
          <p>Settings</p>
          <button onClick={toggleTheme}>Switch Theme ({theme})</button>
        </div>
      )}
    </div>
  );
}