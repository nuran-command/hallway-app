import React, { useState } from 'react';
import HallwayLogo from './HallwayLogo';
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
            <HallwayLogo size={60} />
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