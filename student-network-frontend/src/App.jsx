import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [boards, setBoards] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch boards
  useEffect(() => {
    fetch('http://localhost:3000/api/boards')
      .then(res => res.json())
      .then(data => setBoards(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loadingUser) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Network</h1>

      {user && (
        <p>
          Logged in as: <b>{user.email}</b>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
        </p>
      )}

      <Routes>
        {!user ? (
          <Route path="*" element={<LoginPage onLogin={setUser} />} />
        ) : (
          <>
            <Route path="/" element={<Boards boards={boards} />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;