import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes, FaUser, FaThumbsUp, FaComment, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import './TopHeader.css';

export default function TopHeader({ user, socket, onLogout, sidebarOpen, setSidebarOpen }) {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('blob:'));

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/api/notifications/${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data.reverse());
                }
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('notification', (notif) => {
                // Only show notification if it's actually for THIS user
                if (notif.to === user.uid) {
                    setNotifications(prev => [notif, ...prev]);
                }
            });
        }

        return () => {
            if (socket) socket.off('notification');
        };
    }, [user.uid, socket]);

    const handleAccept = async (id) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}/accept`, { method: 'POST' });
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'accepted' } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = async (id) => {
        try {
            await fetch(`${API_URL}/api/notifications/${id}/clear`, { method: 'POST' });
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    return (
        <header className="top-header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ display: 'flex', opacity: 1 }}
                >
                    ☰
                </button>
                <div className="header-search-dummy">
                    <input type="text" placeholder="Search HallWay..." />
                </div>
            </div>

            <div className="header-right">
                <div className="notification-wrapper">
                    <button className="notification-btn" onClick={() => setShowDropdown(!showDropdown)}>
                        <FaBell />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {showDropdown && (
                        <div className="notification-dropdown card">
                            <div className="dropdown-header">
                                <h3>Notifications</h3>
                                <button onClick={() => setNotifications([])}>Clear All</button>
                            </div>
                            <div className="dropdown-list">
                                {notifications.length === 0 ? (
                                    <p className="empty-notif">No new notifications</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`notif-item ${n.status}`}>
                                            <div className="notif-icon" style={{
                                                background: n.type === 'like' ? 'rgba(239,68,68,0.12)' :
                                                    n.type === 'comment' ? 'rgba(16,185,129,0.12)' :
                                                        n.type === 'message' ? 'rgba(99,102,241,0.12)' : '#6366f1'
                                            }}>
                                                {n.type === 'like' ? <FaThumbsUp style={{ color: '#ef4444' }} /> :
                                                    n.type === 'comment' ? <FaComment style={{ color: '#10b981' }} /> :
                                                        n.type === 'message' ? <FaEnvelope style={{ color: '#6366f1' }} /> :
                                                            <FaUser style={{ color: 'white' }} />}
                                            </div>
                                            <div className="notif-content">
                                                <p>
                                                    {n.type === 'like' && <><strong>{n.fromName}</strong> liked your post.</>}
                                                    {n.type === 'comment' && <><strong>{n.fromName}</strong> commented on your post.</>}
                                                    {n.type === 'message' && <><Link to={`/chat/${n.from}`}><strong>{n.fromName}</strong></Link> sent you a message.</>}
                                                    {n.type === 'friend_request' && <><strong>{n.fromName}</strong> sent you a friend request.</>}
                                                </p>
                                                <span className="notif-time">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                                {n.type === 'friend_request' && n.status !== 'accepted' && (
                                                    <div className="notif-actions">
                                                        <button className="accept-btn" onClick={() => handleAccept(n.id)}>
                                                            <FaCheck /> Accept
                                                        </button>
                                                        <button className="decline-btn" onClick={() => handleClear(n.id)}>
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                )}
                                                {n.status === 'accepted' && n.type === 'friend_request' && (
                                                    <div className="accepted-badge">Friends now! 🎉</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile-nav">
                    <Link to="/profile" className="header-user-info">
                        {isUrl(user.photoURL) ? (
                            <img src={user.photoURL} alt="User" />
                        ) : (
                            <div className="avatar-small">{user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '?')}</div>
                        )}
                        <span>{user.displayName || user.email?.split('@')[0]}</span>
                    </Link>
                    <button className="logout-btn-nav" onClick={onLogout}>Logout</button>
                </div>
            </div>
        </header>
    );
}
