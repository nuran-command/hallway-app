import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave } from 'react-icons/fa';
import HallwayLogo from './HallwayLogo';
import './Profile.css';

export default function Profile() {
    const user = auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState('Enthusiastic student and explorer of ideas.');
    const [stats, setStats] = useState({ posts: 0, boards: 0, likes: 0 });

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:3000/api/user-stats/${user.uid}`)
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error("Error fetching stats:", err));
        }
    }, [user]);

    if (!user) return <p className="loading-state">Please log in to view your profile.</p>;

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <div className="card profile-header-card">
                <div className="profile-cover"></div>
                <div className="profile-info-main">
                    <div className="profile-avatar-large">
                        {user.photoURL ? <img src={user.photoURL} alt="" /> : user.email[0].toUpperCase()}
                    </div>
                    <div className="profile-title-group">
                        <h2 className="profile-name-text">{displayName || user.email.split('@')[0]}</h2>
                        <p className="profile-email-text">{user.email}</p>
                    </div>
                    <button className="edit-profile-btn" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                        {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit Profile</>}
                    </button>
                </div>
            </div>

            <div className="profile-grid">
                <div className="card profile-details-card">
                    <h3>Personal Information</h3>
                    <div className="detail-item">
                        <FaIdCard className="detail-icon" />
                        <div className="detail-content">
                            <span>Full Name</span>
                            {isEditing ? (
                                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="profile-input" />
                            ) : (
                                <p>{displayName || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                    <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <div className="detail-content">
                            <span>Email Address</span>
                            <p>{user.email}</p>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <div className="detail-content">
                            <span>Biography</span>
                            {isEditing ? (
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="profile-textarea" />
                            ) : (
                                <p>{bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card profile-stats-card">
                    <h3 className="stats-header-title">Activity Summary</h3>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-number">{stats.posts}</span>
                            <span className="stat-label">POSTS</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{stats.boards}</span>
                            <span className="stat-label">BOARDS</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{stats.likes}</span>
                            <span className="stat-label">LIKES</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

