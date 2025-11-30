import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Header.css";

function Header({ user }) {
  if (!user) return null;

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="header-title">Student Network</h1>
      </div>

      <div className="header-right">
        <span className="header-user">{user.email}</span>
        <button className="header-btn" onClick={() => signOut(auth)}>Logout</button>
      </div>
    </div>
  );
}

export default Header;