import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import { ThemeProvider, useTheme } from './themeStore';
import './theme.css';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function AppContent() {
  const [boards, setBoards] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
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
    <div style={{ display: 'flex' }}>
      {user && <Sidebar />}
      <div style={{ marginLeft: user ? 230 : 0, padding: '20px', flexGrow: 1 }}>
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

        {user && (
          <button style={{ position: 'fixed', bottom: 20, right: 20 }} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}