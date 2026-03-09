import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHashtag, FaUsers, FaArrowRight } from "react-icons/fa";
import HallwayLogo from "./HallwayLogo";
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
          <HallwayLogo size={64} />
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