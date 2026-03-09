import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHashtag, FaUsers, FaArrowRight, FaPlus, FaRocket, FaRegComment, FaHistory } from "react-icons/fa";
import HallwayLogo from "./HallwayLogo";
import "./Dashboard.css";

export default function Dashboard() {
  const [recentBoards, setRecentBoards] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentChats] = useState([
    { name: "IT Students Group", type: "Group" },
    { name: "General Chat", type: "Group" },
  ]);

  useEffect(() => {
    // Fetch boards
    fetch("http://localhost:3000/api/boards")
      .then(res => res.json())
      .then(data => setRecentBoards(data.slice(0, 3)))
      .catch(err => console.error(err));

    // Fetch global posts
    fetch("http://localhost:3000/api/recent-posts")
      .then(res => res.json())
      .then(data => setRecentPosts(data))
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
          <p>Step into your community. Explore, join, and connect.</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="quick-actions-grid">
          <Link to="/boards" className="quick-action-card">
            <div className="action-icon purple"><FaPlus /></div>
            <span>Create Post</span>
          </Link>
          <Link to="/boards" className="quick-action-card">
            <div className="action-icon blue"><FaRocket /></div>
            <span>New Content</span>
          </Link>
          <Link to="/boards" className="quick-action-card">
            <div className="action-icon green"><FaUsers /></div>
            <span>Discover</span>
          </Link>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* Recent Global Discussions */}
          <section className="dashboard-section">
            <div className="section-header">
              <div className="title-with-icon">
                <FaHistory className="header-icon" />
                <h3>Recent Global Activity</h3>
              </div>
            </div>
            <div className="activity-list">
              {recentPosts.length > 0 ? recentPosts.map(post => (
                <div key={post.id} className="activity-item card">
                  <div className="item-avatar">
                    {post.userEmail ? post.userEmail[0].toUpperCase() : "A"}
                  </div>
                  <div className="item-content">
                    <div className="item-meta">
                      <strong>{post.userEmail ? post.userEmail.split('@')[0] : "Anonymous"}</strong>
                      <span>posted on Board #{post.boardId}</span>
                    </div>
                    <p>{post.text}</p>
                    <div className="item-footer">
                      <FaRegComment /> 0 comments
                    </div>
                  </div>
                </div>
              )) : (
                <p className="empty-state">No recent activity found.</p>
              )}
            </div>
          </section>
        </div>

        <div className="dashboard-right-col">
          {/* Recommended Boards */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Recommended</h3>
              <Link to="/boards" className="view-all">See all</Link>
            </div>
            <div className="vertical-grid">
              {recentBoards.map(b => (
                <Link key={b.id} to={`/board/${b.id}`} className="card stat-card miniature">
                  <div className="mini-icon">
                    <FaHashtag />
                  </div>
                  <div className="stat-info">
                    <h4>{b.name}</h4>
                  </div>
                  <FaArrowRight className="mini-arrow" />
                </Link>
              ))}
            </div>
          </section>

          {/* Top Communities */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Communities</h3>
            </div>
            <div className="vertical-grid">
              {recentChats.map((chat, i) => (
                <div key={i} className="card stat-card miniature">
                  <div className="mini-icon blue">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h4>{chat.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}