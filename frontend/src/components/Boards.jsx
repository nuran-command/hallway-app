import React from "react";
import { Link } from "react-router-dom";
import { FaHashtag } from "react-icons/fa";
import "./Boards.css";

function Boards({ boards }) {
  return (
    <div className="boards-container">
      <h2 className="boards-title">Student Boards</h2>

      <div className="boards-grid">
        {boards.map((b) => (
          <Link key={b.id} to={`/board/${b.id}`} className="board-link">
            <div className="card board-card">
              <div className="board-icon">
                <FaHashtag />
              </div>
              <h3 className="board-name">{b.name}</h3>
              <p style={{ marginTop: 8, fontSize: '0.85rem', opacity: 0.6 }}>Explore posts in {b.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Boards;