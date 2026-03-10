import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave, FaArrowLeft, FaRocket, FaCompass, FaRegComment, FaUserPlus, FaCamera, FaLock } from 'react-icons/fa';
import HallwayLogo from './HallwayLogo';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { API_URL } from '../config';
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
    const [stats, setStats] = useState({ posts: 0, boards: 0, likes: 0, friends: 0 });
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');

    useEffect(() => {
        if (targetUserId) {
            setLoading(true);

            const fetchProfile = async () => {
                try {
                    // Slight delay for backend consistency
                    await new Promise(r => setTimeout(r, 1000));
                    const statsRes = await fetch(`${API_URL}/api/user-stats/${targetUserId}`);
                    if (!statsRes.ok) throw new Error("Stats load error");
                    const data = await statsRes.json();
                    setStats(data);

                    if (data.profile) {
                        setDisplayName(data.profile.displayName || (isOwner ? currentUser.displayName : 'Student'));
                        setPhotoURL(data.profile.photoURL || '');
                        if (!isOwner) {
                            setBio(data.profile.bio || 'This user is part of the HallWay community.');
                        }
                    }

                    if (currentUser && !isOwner) {
                        try {
                            const friendsRes = await fetch(`${API_URL}/api/friends/${currentUser.uid}`);
                            if (friendsRes.ok) {
                                const friends = await friendsRes.json();
                                setIsFriend(friends.some(f => f.id === targetUserId));
                            }
                        } catch (e) {
                            console.log("Friend check delayed...");
                        }
                    }

                    if (isOwner) {
                        setDisplayName(currentUser?.displayName || data.profile?.displayName || '');
                        setPhotoURL(currentUser?.photoURL || data.profile?.photoURL || '');
                        setEmail(currentUser?.email || '');
                        setBio(localStorage.getItem(`bio_${currentUser?.uid}`) || data.profile?.bio || 'Enthusiastic student.');
                    }
                } catch (err) {
                    console.error("Error fetching stats:", err);
                } finally {
                    setLoading(false);
                }
            };

            const fetchUserPosts = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/posts?userId=${targetUserId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUserPosts(Array.isArray(data) ? data : []);
                    }
                } catch (err) {
                    console.error("Error fetching user posts:", err);
                }
            };

            fetchProfile();
            fetchUserPosts();
        }
    }, [targetUserId, isOwner, currentUser]);

    const handleAddFriend = async () => {
        try {
            await fetch(`${API_URL}/api/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: currentUser.uid,
                    to: targetUserId,
                    fromName: currentUser.displayName || currentUser.email
                })
            });
            alert('Friend request sent! They will see it in their notifications.');
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
                        <h2 className="profile-name-text">{displayName || (email ? email.split('@')[0] : 'HallWay Explorer')}</h2>
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
                                    <span className="stat-number">{stats?.likes || 0}</span>
                                    <span className="stat-label">LIKES</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">{stats?.friends || 0}</span>
                                    <span className="stat-label">FRIENDS</span>
                                </div>
                            </div>

                            {/* XP & Level Gamification */}
                            {(() => {
                                const xp = ((stats?.posts || 0) * 50) + ((stats?.likes || 0) * 5);
                                const levels = [
                                    { name: 'Explorer', min: 0, max: 100, color: '#64748b' },
                                    { name: 'Contributor', min: 100, max: 300, color: '#6366f1' },
                                    { name: 'Scholar', min: 300, max: 700, color: '#10b981' },
                                    { name: 'Legend', min: 700, max: 1500, color: '#f59e0b' },
                                    { name: 'HallWay Master', min: 1500, max: 1500, color: '#ec4899' },
                                ];
                                const level = levels.findLast(l => xp >= l.min) || levels[0];
                                const nextLevel = levels[levels.indexOf(level) + 1];
                                const progress = nextLevel
                                    ? Math.min(100, Math.max(0, ((xp - (level?.min || 0)) / ((nextLevel?.min || 1) - (level?.min || 0))) * 100))
                                    : 100;
                                return (
                                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LEVEL</span>
                                                <h4 style={{ margin: '2px 0 0', fontSize: '1.2rem', color: level.color }}>{level.name}</h4>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: level.color }}>{xp}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>XP</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--bg-color)', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 6 }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color || level.color})`,
                                                borderRadius: 999,
                                                transition: 'width 1s ease'
                                            }} />
                                        </div>
                                        {nextLevel && (
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                                {nextLevel.min - xp} XP to reach <strong>{nextLevel.name}</strong>
                                            </p>
                                        )}
                                        {/* Badges */}
                                        <div style={{ marginTop: 20 }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, marginBottom: 10 }}>EARNED BADGES</h4>
                                            <div className="badge-list" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                {stats.posts >= 1 && <div className="user-badge" style={{ borderColor: '#6366f1' }}><FaCompass style={{ color: '#6366f1' }} /> Explorer</div>}
                                                {stats.posts >= 5 && <div className="user-badge" style={{ borderColor: '#f59e0b' }}><FaRocket style={{ color: '#f59e0b' }} /> Contributor</div>}
                                                {(stats.likes || 0) >= 10 && <div className="user-badge" style={{ borderColor: '#ec4899' }}><FaRegComment style={{ color: '#ec4899' }} /> Star</div>}
                                                {stats.posts === 0 && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Post to earn your first badge! 🎯</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Recent User Activity List */}
                        <div className="card profile-activity-card" style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
                            <div className="activity-list">
                                {userPosts.length > 0 ? userPosts.map(post => (
                                    <div key={post.id} className="activity-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                                        <p>{post.text}</p>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
                                            {new Date(post.createdAt?.seconds ? post.createdAt.seconds * 1000 : post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ textAlign: 'center', opacity: 0.5, padding: '24px' }}>No posts yet from this student.</p>
                                )}
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

