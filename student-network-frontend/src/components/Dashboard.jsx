import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [recentBoards, setRecentBoards] = useState([]);
  const [recentChats] = useState(["Alice", "Bob", "Charlie"]); // later replace with real chats

  useEffect(() => {
    fetch("http://localhost:3000/api/boards")
      .then(res => res.json())
      .then(data => setRecentBoards(data.slice(0, 3))) // take first 3 as “recent”
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Profile section */}
      <section className="profile-preview">
        <div className="avatar">👤</div>
        <div>
          <h3>Your Profile</h3>
          <p>Welcome back!</p>
        </div>
      </section>

      {/* Boards section */}
      <section className="section-block">
        <h3>Recent Boards</h3>
        <div className="cards-grid">
          {recentBoards.map((b) => (
            <Link key={b.id} to={`/board/${b.id}`} className="card">
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Chats section */}
      <section className="section-block">
        <h3>Recent Chats</h3>
        <div className="cards-grid">
          {recentChats.map((c, i) => (
            <div key={i} className="card">
              {c}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}