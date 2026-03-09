import React, { useState } from 'react';
import { auth } from '../firebase';
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave } from 'react-icons/fa';
import './Profile.css';

export default function Profile() {
    const user = auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState('Enthusiastic student and explorer of ideas.');

    if (!user) return <p>Please log in to view your profile.</p>;

    const handleSave = () => {
        // In a real app, you would update Firebase Profile here
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
                    <h3>Activity Summary</h3>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-number">12</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">4</span>
                            <span className="stat-label">Boards</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">48</span>
                            <span className="stat-label">Likes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
