import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';

import Header from './components/Header';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [boards, setBoards] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch boards from backend
  useEffect(() => {
    fetch('http://localhost:3000/api/boards')
      .then(res => res.json())
      .then(data => setBoards(data))
      .catch(err => console.error(err));
  }, []);

  if (loadingUser) return <p>Loading...</p>;

  return (
    <div>

      {/* Header only if logged in */}
      <Header user={user} />

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