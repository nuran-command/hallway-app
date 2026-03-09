import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHashtag, FaSearch, FaPlus, FaUsers, FaArrowRight } from "react-icons/fa";
import "./Boards.css";

function Boards({ boards }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...new Set(boards.map(b => b.category || "General"))];

  const filteredBoards = boards.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="boards-container">
      <div className="boards-header-section">
        <div className="title-group">
          <h2 className="boards-title">Explore Communities</h2>
          <p className="boards-subtitle">Join different boards to connect with students sharing your interests.</p>
        </div>
        <button className="create-board-btn">
          <FaPlus /> Create New Board
        </button>
      </div>

      <div className="boards-controls">
        <div className="search-bar-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for boards or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="boards-search-input"
          />
        </div>
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="boards-grid">
        {filteredBoards.map((b) => (
          <Link key={b.id} to={`/board/${b.id}`} className="board-link">
            <div className="card board-card-premium">
              <div className="board-card-header">
                <div className={`board-icon-large ${(b.category || 'General').toLowerCase()}`}>
                  <FaHashtag />
                </div>
                <div className="board-meta">
                  <span className="board-category-tag">{b.category || 'General'}</span>
                  <div className="board-member-count">
                    <FaUsers /> {(b.members || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="board-card-body">
                <h3 className="board-name">{b.name}</h3>
                <p className="board-description">{b.description || `Discussion board for ${b.name}`}</p>
              </div>
              <div className="board-card-footer">
                <span className="join-text">View Discussions</span>
                <FaArrowRight className="arrow-icon" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBoards.length === 0 && (
        <div className="no-results">
          <p>No boards found matching your search. Try a different keyword!</p>
        </div>
      )}
    </div>
  );
}

export default Boards;