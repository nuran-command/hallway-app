import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHashtag, FaUsers, FaArrowRight, FaPlus, FaRocket, FaRegComment, FaHistory, FaUserPlus, FaCircle, FaThumbsUp } from "react-icons/fa";
import HallwayLogo from "./HallwayLogo";
import Skeleton from "./Skeleton";
import { auth } from "../firebase";
import { API_URL } from '../config';
import "./Dashboard.css";

export default function Dashboard({ socket, boards }) {
  const [recentPosts, setRecentPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('blob:'));

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const postsRes = await fetch(`${API_URL}/api/recent-posts`);
        const postsData = await postsRes.json();
        if (Array.isArray(postsData)) setRecentPosts(postsData);

        const friendsRes = await fetch(`${API_URL}/api/friends/${currentUser.uid}`);
        const friendsData = await friendsRes.json();
        if (Array.isArray(friendsData)) setFriends(friendsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket events
    socket.on('new_post', (post) => {
      setRecentPosts(prev => [post, ...prev.slice(0, 4)]);
    });

    socket.on('online_status_change', ({ userId, status }) => {
      setFriends(prev => prev.map(f => f.id === userId ? { ...f, status } : f));
    });

    socket.on('friendship_updated', fetchData);

    return () => {
      socket.off('new_post');
      socket.off('online_status_change');
    };
  }, [currentUser, socket]);

  const handleAddFriend = async (toUserId) => {
    try {
      await fetch(`${API_URL}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: currentUser.uid, to: toUserId, fromName: currentUser.displayName || currentUser.email })
      });
      alert('Friend request sent!');
    } catch (err) {
      console.error(err);
    }
  };

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

            {loading ? (
              <div className="activity-list">
                {[1, 2, 3].map(i => <Skeleton key={i} height="100px" borderRadius="16px" />)}
              </div>
            ) : (
              <div className="activity-list">
                {recentPosts.length > 0 ? recentPosts.map(post => (
                  <div key={post.id} className="activity-item card" onClick={() => navigate(`/board/${post.boardId}`)} style={{ cursor: 'pointer' }}>
                    <Link to={`/profile/${post.userId}`} className="item-avatar" onClick={(e) => e.stopPropagation()}>
                      {post.displayName ? post.displayName[0].toUpperCase() : (post.userEmail ? post.userEmail[0].toUpperCase() : "A")}
                    </Link>
                    <div className="item-content">
                      <div className="item-meta">
                        <Link to={`/profile/${post.userId}`} className="item-author-link" onClick={(e) => e.stopPropagation()}>
                          <strong>{post.displayName || (post.userEmail ? post.userEmail.split('@')[0] : "Anonymous")}</strong>
                        </Link>
                        <span>posted on <Link to={`/board/${post.boardId}`} onClick={(e) => e.stopPropagation()}>
                          {boards?.find(b => String(b.id).trim() === String(post.boardId).trim())?.name || `Board #${post.boardId}`}
                        </Link></span>
                      </div>
                      <p>{post.text}</p>
                      <div className="item-footer">
                        <FaRegComment /> {post.comments?.length || 0} comments • <FaThumbsUp /> {post.likes?.length || 0}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="empty-state">No recent activity found.</p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="dashboard-right-col">
          {/* Friends Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>HallWay Friends</h3>
              <FaUsers className="header-icon" />
            </div>
            <div className="vertical-grid">
              {!Array.isArray(friends) || friends.length === 0 ? (
                <div className="card miniature" style={{ padding: '16px', textAlign: 'center', opacity: 0.6 }}>
                  <p style={{ fontSize: '0.8rem' }}>No friends yet. Add peers to see their status!</p>
                </div>
              ) : (
                friends.map(f => (
                  <Link key={f.id} to={`/profile/${f.id}`} className="friend-card-link">
                    <div className="card stat-card miniature friend-hover">
                      <div className={`mini-avatar ${f.status}`}>
                        {isUrl(f.photoURL) ? (
                          <img src={f.photoURL} alt="Avatar" />
                        ) : (
                          <span>{f.displayName ? f.displayName[0].toUpperCase() : '?'}</span>
                        )}
                        <FaCircle className="status-dot" />
                      </div>
                      <div className="stat-info">
                        <h4>{f.displayName || 'Peer'}</h4>
                        <span className="status-text">{f.status}</span>
                      </div>
                      <FaArrowRight className="mini-arrow" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Recommended Boards */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Boards to Join</h3>
              <Link to="/boards" className="view-all">See all</Link>
            </div>
            <div className="vertical-grid">
              {Array.isArray(boards) && boards.slice(0, 3).map(b => (
                <Link key={b.id} to={`/board/${b.id}`} className="board-join-link" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card stat-card miniature board-join-item">
                    <div className="mini-icon">
                      <FaHashtag />
                    </div>
                    <div className="stat-info">
                      <h4>{b.name}</h4>
                    </div>
                    <FaArrowRight className="mini-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}