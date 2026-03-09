import React from 'react';
import { useTheme } from '../themeStore';
import { FaMoon, FaSun, FaBell, FaLock, FaUserShield, FaLanguage } from 'react-icons/fa';
import './Settings.css';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="settings-container">
            <h2 className="settings-title">App Settings</h2>

            <div className="settings-grid">
                {/* Appearance Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box blue">
                            {theme === 'dark' ? <FaMoon /> : <FaSun />}
                        </div>
                        <h3>Appearance</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Theme Mode</h4>
                            <p>Switch between light and dark themes</p>
                        </div>
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {theme === 'dark' ? (
                                <><FaSun /> Light Mode</>
                            ) : (
                                <><FaMoon /> Dark Mode</>
                            )}
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box orange">
                            <FaBell />
                        </div>
                        <h3>Notifications</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Push Notifications</h4>
                            <p>Receive alerts about new posts</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </section>

                {/* Privacy & Security Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box red">
                            <FaLock />
                        </div>
                        <h3>Privacy & Security</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Private Account</h4>
                            <p>Only approved users can see your activity</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Two-Factor Auth</h4>
                            <p>Add an extra layer of security</p>
                        </div>
                        <button className="settings-action-btn">Enable</button>
                    </div>
                </section>

                {/* App Language Section */}
                <section className="card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-icon-box purple">
                            <FaLanguage />
                        </div>
                        <h3>Language</h3>
                    </div>
                    <div className="settings-item">
                        <div className="settings-info">
                            <h4>Primary Language</h4>
                            <p>Choose your preferred language</p>
                        </div>
                        <select className="settings-select">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="ru">Russian</option>
                            <option value="fr">French</option>
                        </select>
                    </div>
                </section>
            </div>
        </div>
    );
}
