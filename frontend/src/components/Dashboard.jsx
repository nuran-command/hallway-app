import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHashtag, FaUsers, FaArrowRight } from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const [recentBoards, setRecentBoards] = useState([]);
  const [recentChats] = useState([
    { name: "IT Students Group", type: "Group" },
    { name: "General Chat", type: "Group" },
  ]);

  useEffect(() => {
    fetch("http://localhost:3000/api/boards")
      .then(res => res.json())
      .then(data => setRecentBoards(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-avatar">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path d="M50 20 C60 20 70 30 70 40 C70 50 60 60 50 60 C40 60 30 50 30 40 C30 30 40 20 50 20" fill="currentColor" />
            <path d="M20 80 C20 70 30 60 50 60 C70 60 80 70 80 80" fill="currentColor" />
            <path d="M70 40 L90 20 M70 50 L90 50 M70 60 L85 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="welcome-text">
          <h2>Welcome to HallWay</h2>
          <p>Explore boards, join conversations, and connect with your peers.</p>
        </div>
      </section>

      {/* Recommended Boards */}
      <section className="dashboard-section">
        <div className="section-header">
          <h3>Recommended Boards</h3>
          <Link to="/boards" className="view-all">View all boards <FaArrowRight /></Link>
        </div>
        <div className="cards-grid">
          {recentBoards.map(b => (
            <Link key={b.id} to={`/board/${b.id}`} className="card stat-card">
              <div className="stat-icon">
                <FaHashtag />
              </div>
              <div className="stat-info">
                <h4>{b.name}</h4>
                <p>Join the discussion</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Communities */}
      <section className="dashboard-section">
        <div className="section-header">
          <h3>Featured Communities</h3>
        </div>
        <div className="cards-grid">
          {recentChats.map((chat, i) => (
            <div key={i} className="card stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h4>{chat.name}</h4>
                <p>{chat.type} • Active now</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}