import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import { useTheme, ThemeProvider } from './themeStore';
import './theme.css';
import './App.css';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [boards, setBoards] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsub();
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
    <div className={`app-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
      {user && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}

      <main className={`content ${sidebarOpen ? "with-sidebar" : ""}`}>
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
      </main>

      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

// Wrap with ThemeProvider in index.js
export function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}