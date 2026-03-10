import React, { useState } from 'react';
import { useTheme } from '../themeStore';
import { auth } from '../firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { API_URL } from '../config';
import {
    FaMoon, FaSun, FaBell, FaLock, FaUser, FaLanguage,
    FaSave, FaKey, FaCheck, FaExclamationTriangle, FaShieldAlt
} from 'react-icons/fa';
import './Settings.css';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const currentUser = auth.currentUser;

    // Profile state
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    // Password state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [pwMsg, setPwMsg] = useState(null);
    const [changingPw, setChangingPw] = useState(false);

    // Notification prefs (stored in localStorage)
    const [notifLikes, setNotifLikes] = useState(
        localStorage.getItem('notif_likes') !== 'false'
    );
    const [notifComments, setNotifComments] = useState(
        localStorage.getItem('notif_comments') !== 'false'
    );
    const [notifMessages, setNotifMessages] = useState(
        localStorage.getItem('notif_messages') !== 'false'
    );
    const [notifFriends, setNotifFriends] = useState(
        localStorage.getItem('notif_friends') !== 'false'
    );

    const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'en');

    const handleSaveProfile = async () => {
        if (!displayName.trim()) return;
        setSavingProfile(true);
        try {
            await updateProfile(currentUser, { displayName: displayName.trim() });
            // Sync to backend
            await fetch('${API_URL}/api/users/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    displayName: displayName.trim(),
                    photoURL: currentUser.photoURL,
                    email: currentUser.email
                })
            });
            setProfileMsg({ type: 'success', text: 'Display name updated!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message });
        } finally {
            setSavingProfile(false);
            setTimeout(() => setProfileMsg(null), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPw || !newPw) return;
        if (newPw.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
        setChangingPw(true);
        try {
            const cred = EmailAuthProvider.credential(currentUser.email, currentPw);
            await reauthenticateWithCredential(currentUser, cred);
            await updatePassword(currentUser, newPw);
            setCurrentPw(''); setNewPw('');
            setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        } catch (err) {
            setPwMsg({ type: 'error', text: 'Incorrect current password.' });
        } finally {
            setChangingPw(false);
            setTimeout(() => setPwMsg(null), 4000);
        }
    };

    const toggleNotif = (key, val, setter) => {
        setter(val);
        localStorage.setItem(key, val.toString());
    };

    const handleLanguage = (e) => {
        setLanguage(e.target.value);
        localStorage.setItem('app_language', e.target.value);
    };

    const NotifToggle = ({ label, desc, storageKey, value, setter }) => (
        <div className="settings-item">
            <div className="settings-info">
                <h4>{label}</h4>
                <p>{desc}</p>
            </div>
            <label className="switch">
                <input type="checkbox" checked={value} onChange={e => toggleNotif(storageKey, e.target.checked, setter)} />
                <span className="slider round"></span>
            </label>
        </div>
    );

    return (
        <div className="settings-container">
            <h2 className="settings-title">Settings</h2>
            <p className="settings-subtitle">Manage your HallWay account preferences</p>

            <div className="settings-grid">
                {/* Account Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box blue"><FaUser /></div>
                        <h3>Account</h3>
                    </div>
                    <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                        <div className="settings-info">
                            <h4>Display Name</h4>
                            <p>This is how others see you across HallWay</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                            <input
                                className="settings-text-input"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="Your display name"
                            />
                            <button className="settings-save-btn" onClick={handleSaveProfile} disabled={savingProfile}>
                                {savingProfile ? '...' : <><FaSave /> Save</>}
                            </button>
                        </div>
                        {profileMsg && (
                            <div className={`settings-msg ${profileMsg.type}`}>
                                {profileMsg.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                                {profileMsg.text}
                            </div>
                        )}
                        <div className="settings-info" style={{ marginTop: 8 }}>
                            <h4>Email</h4>
                            <p style={{ fontWeight: 600, color: 'var(--text-color)' }}>{currentUser?.email}</p>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box purple">
                            {theme === 'dark' ? <FaMoon /> : <FaSun />}
                        </div>
                        <h3>Appearance</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Theme Mode</h4>
                            <p>Currently: <strong>{theme === 'dark' ? 'Dark' : 'Light'} Mode</strong></p>
                        </div>
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {theme === 'dark' ? <><FaSun /> Light Mode</> : <><FaMoon /> Dark Mode</>}
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box orange"><FaBell /></div>
                        <h3>Notifications</h3>
                    </div>
                    <NotifToggle label="Like Notifications" desc="When someone likes your post" storageKey="notif_likes" value={notifLikes} setter={setNotifLikes} />
                    <NotifToggle label="Comment Notifications" desc="When someone comments on your post" storageKey="notif_comments" value={notifComments} setter={setNotifComments} />
                    <NotifToggle label="Message Notifications" desc="When a friend sends you a message" storageKey="notif_messages" value={notifMessages} setter={setNotifMessages} />
                    <NotifToggle label="Friend Request Alerts" desc="When someone wants to connect" storageKey="notif_friends" value={notifFriends} setter={setNotifFriends} />
                </section>

                {/* Security Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box red"><FaShieldAlt /></div>
                        <h3>Security</h3>
                    </div>
                    <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                        <div className="settings-info">
                            <h4>Change Password</h4>
                            <p>Use a strong password to protect your account</p>
                        </div>
                        <input
                            className="settings-text-input"
                            type="password"
                            placeholder="Current password"
                            value={currentPw}
                            onChange={e => setCurrentPw(e.target.value)}
                        />
                        <input
                            className="settings-text-input"
                            type="password"
                            placeholder="New password (min. 6 characters)"
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                        />
                        <button className="settings-save-btn" onClick={handleChangePassword} disabled={changingPw || !currentPw || !newPw}>
                            {changingPw ? '...' : <><FaKey /> Change Password</>}
                        </button>
                        {pwMsg && (
                            <div className={`settings-msg ${pwMsg.type}`}>
                                {pwMsg.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                                {pwMsg.text}
                            </div>
                        )}
                    </div>
                </section>

                {/* Language Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box green"><FaLanguage /></div>
                        <h3>Language</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Primary Language</h4>
                            <p>Choose your preferred interface language</p>
                        </div>
                        <select className="settings-select" value={language} onChange={handleLanguage}>
                            <option value="en">🇬🇧 English</option>
                            <option value="ru">🇷🇺 Russian</option>
                            <option value="kz">🇰🇿 Kazakh</option>
                            <option value="es">🇪🇸 Spanish</option>
                            <option value="fr">🇫🇷 French</option>
                            <option value="de">🇩🇪 German</option>
                        </select>
                    </div>
                </section>
            </div>
        </div>
    );
}
