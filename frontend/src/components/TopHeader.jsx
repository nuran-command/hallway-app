import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TopHeader.css';

export default function TopHeader({ user, socket, onLogout, sidebarOpen, setSidebarOpen }) {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('blob:'));

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/notifications/${user.uid}`);
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
                setNotifications(prev => [notif, ...prev]);
                // Optional: show a toast
            });
        }

        return () => {
            if (socket) socket.off('notification');
        };
    }, [user.uid, socket]);

    const handleAccept = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/notifications/${id}/accept`, { method: 'POST' });
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'accepted' } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/notifications/${id}/clear`, { method: 'POST' });
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    return (
        <header className="top-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                                            <div className="notif-icon">
                                                <FaUser />
                                            </div>
                                            <div className="notif-content">
                                                <p>
                                                    <strong>{n.fromName}</strong> sent you a friend request.
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
                                                {n.status === 'accepted' && (
                                                    <div className="accepted-badge">Friends now!</div>
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
