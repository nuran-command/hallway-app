import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHashtag, FaSearch, FaPlus, FaUsers, FaArrowRight, FaTimes } from "react-icons/fa";
import Skeleton from "./Skeleton";
import "./Boards.css";

function Boards({ boards, onBoardCreated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: '', description: '', category: 'General' });
  const [creating, setCreating] = useState(false);

  const categories = ["All", "Academic", "Social", "Events", "Lifestyle", "General"];

  const filteredBoards = boards.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoard.name) return;
    setCreating(true);
    try {
      const res = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      });
      if (res.ok) {
        onBoardCreated();
        setShowModal(false);
        setNewBoard({ name: '', description: '', category: 'General' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="boards-container">
      <div className="boards-header-section">
        <div className="title-group">
          <h2 className="boards-title">Explore Communities</h2>
          <p className="boards-subtitle">Join different boards to connect with students sharing your interests.</p>
        </div>
        <button className="create-board-btn" onClick={() => setShowModal(true)}>
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
        {boards.length === 0 ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="card board-card-premium">
              <Skeleton height="150px" borderRadius="16px" />
              <div style={{ padding: '0 12px' }}>
                <Skeleton width="60%" height="24px" />
                <Skeleton width="90%" height="16px" />
              </div>
            </div>
          ))
        ) : (
          filteredBoards.map((b) => (
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
          ))
        )}
      </div>

      {boards.length > 0 && filteredBoards.length === 0 && (
        <div className="no-results">
          <p>No boards found matching your search. Try a different keyword!</p>
        </div>
      )}

      {/* Create Board Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Create New Board</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateBoard} className="modal-form">
              <div className="form-group">
                <label>Board Name</label>
                <input
                  required
                  placeholder="e.g. Photography Club"
                  value={newBoard.name}
                  onChange={e => setNewBoard({ ...newBoard, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newBoard.category}
                  onChange={e => setNewBoard({ ...newBoard, category: e.target.value })}
                >
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Tell students what this board is about..."
                  value={newBoard.description}
                  onChange={e => setNewBoard({ ...newBoard, description: e.target.value })}
                />
              </div>
              <button type="submit" className="submit-board-btn" disabled={creating}>
                {creating ? 'Creating...' : 'Create Board'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Boards;