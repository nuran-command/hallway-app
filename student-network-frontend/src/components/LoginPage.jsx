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

        <h2 className="login-title">Welcome</h2>

        {error && <div className="error-text">{error}</div>}

        <div className="input-group">
          <input
            type="email"
            className="login-input"
            placeholder="Email"
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
          <button className="login-btn" onClick={login}>Login</button>
          <button className="register-btn" onClick={register}>Register</button>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;