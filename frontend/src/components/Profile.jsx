import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave, FaArrowLeft, FaRocket, FaCompass, FaRegComment, FaUserPlus, FaCamera, FaLock } from 'react-icons/fa';
import HallwayLogo from './HallwayLogo';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import './Profile.css';

export default function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;
    const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('blob:'));

    const isOwner = !userId || userId === currentUser?.uid;
    const targetUserId = userId || currentUser?.uid;

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('Enthusiastic student and explorer of ideas.');
    const [stats, setStats] = useState({ posts: 0, boards: 0, likes: 0 });
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');

    useEffect(() => {
        if (targetUserId) {
            setLoading(true);

            const fetchProfile = async () => {
                try {
                    const statsRes = await fetch(`http://localhost:3000/api/user-stats/${targetUserId}`);
                    const data = await statsRes.json();
                    setStats(data);

                    if (currentUser && !isOwner) {
                        const friendsRes = await fetch(`http://localhost:3000/api/friends/${currentUser.uid}`);
                        const friends = await friendsRes.json();
                        setIsFriend(friends.some(f => f.id === targetUserId));
                    }

                    if (isOwner) {
                        setDisplayName(currentUser?.displayName || '');
                        setPhotoURL(currentUser?.photoURL || '');
                        setEmail(currentUser?.email || '');
                        setBio(localStorage.getItem(`bio_${currentUser?.uid}`) || 'Enthusiastic student and explorer of ideas.');
                    } else {
                        setDisplayName(data.displayName || 'Student');
                        setPhotoURL(data.photoURL || '');
                        setEmail('•••••@•••••.com');
                        setBio('This user has shared their passion for learning with the HallWay community.');
                    }
                } catch (err) {
                    console.error("Error fetching stats:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        }
    }, [targetUserId, isOwner, currentUser]);

    const handleAddFriend = async () => {
        try {
            await fetch('http://localhost:3000/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: currentUser.uid, to: targetUserId })
            });
            alert('Friend request sent!');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p className="loading-state">Loading Profile...</p>;
    if (!currentUser && !userId) return <p className="loading-state">Please log in to view your profile.</p>;

    const handleSave = async () => {
        try {
            await updateProfile(currentUser, {
                displayName: displayName
            });
            localStorage.setItem(`bio_${currentUser.uid}`, bio);
            setIsEditing(false);
            alert("Profile updated!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save profile changes.");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileRef = ref(storage, `avatars/${currentUser.uid}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            await updateProfile(currentUser, { photoURL: url });
            setPhotoURL(url);
            alert("Avatar updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to upload avatar.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="profile-container">
            {!isOwner && (
                <button className="profile-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
            )}

            <div className="card profile-header-card">
                <div className="profile-cover"></div>
                <div className="profile-info-main">
                    <div className="profile-avatar-large">
                        {isUrl(photoURL) ? (
                            <img src={photoURL} alt="Avatar" />
                        ) : (
                            displayName ? displayName[0].toUpperCase() : (email ? email[0].toUpperCase() : '?')
                        )}
                        {isOwner && (
                            <label className="avatar-upload-overlay">
                                <FaCamera />
                                <input type="file" onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                            </label>
                        )}
                        {uploading && <div className="avatar-loader"></div>}
                    </div>
                    <div className="profile-title-group">
                        <h2 className="profile-name-text">{displayName || email.split('@')[0] || 'HallWay Explorer'}</h2>
                        <p className="profile-email-text">{email}</p>
                    </div>
                    {isOwner ? (
                        <button className="edit-profile-btn" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                            {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit Profile</>}
                        </button>
                    ) : (
                        currentUser && !isFriend && (
                            <button className="edit-profile-btn" style={{ background: '#10b981' }} onClick={handleAddFriend}>
                                <FaUserPlus /> Add Friend
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="profile-grid">
                {isOwner || isFriend ? (
                    <>
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
                                    <p>{email}</p>
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
                                    <span className="stat-number">{stats.likes || 0}</span>
                                    <span className="stat-label">LIKES</span>
                                </div>
                            </div>

                            <div className="badges-section" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: 12, fontSize: '0.9rem', opacity: 0.7 }}>Earned Badges</h4>
                                <div className="badge-list" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {stats.posts >= 5 && <div className="user-badge" title="Top Contributor"><FaRocket style={{ color: '#f59e0b' }} /> Contributor</div>}
                                    {stats.posts >= 1 && <div className="user-badge" title="Active Explorer"><FaCompass style={{ color: '#6366f1' }} /> Explorer</div>}
                                    {stats.likes >= 10 && <div className="user-badge" title="Social Star"><FaRegComment style={{ color: '#ec4899' }} /> Star</div>}
                                    {stats.posts === 0 && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Start posting to earn badges!</span>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card profile-private-card" style={{ gridColumn: '1 / -1', padding: '64px 24px', textAlign: 'center' }}>
                        <FaLock style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Profile is Private</h3>
                        <p style={{ color: '#64748b' }}>Connect as a friend to view their full profile and recent HallWay activity.</p>
                    </div>
                )}
            </div>
        </div >
    );
}

