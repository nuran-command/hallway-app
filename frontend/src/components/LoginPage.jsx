import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setError("");
      const res = await signInWithEmailAndPassword(auth, email, password);
      onLogin(res.user);
    } catch (err) {
      setError(err.code.replace("auth/", "").replace(/-/g, " "));
    }
  };

  const register = async () => {
    try {
      setError("");
      const res = await createUserWithEmailAndPassword(auth, email, password);
      onLogin(res.user);
    } catch (err) {
      setError(err.code.replace("auth/", "").replace(/-/g, " "));
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 100 100" width="40" height="40">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M10 10 L50 40 L90 10" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M10 90 L50 60 L90 90" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="40" y="40" width="20" height="30" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="5" r="3" fill="#fbbf24" />
            </svg>
          </div>
          <h2 className="login-title">HallWay</h2>
          <p className="login-subtitle">Step into your community</p>
        </div>

        {error && <div className="error-text">{error}</div>}

        <div className="input-group">
          <input
            type="email"
            className="login-input"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="login-buttons">
          <button className="login-btn" onClick={login}>Sign In</button>
          <button className="register-btn" onClick={register}>Don't have an account? Register</button>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;