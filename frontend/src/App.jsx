import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import Profile from './components/Profile';
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
    const unsub = onAuthStateChanged(auth, currentUser => {
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

  if (loadingUser) return <div className="loading-screen"><p>Loading...</p></div>;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={setUser} />} />
      </Routes>
    );
  }

  return (
    <div className={`app-wrapper ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} />

      <main className="main-content">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="user-profile-nav">
            <span>{user.email}</span>
            <button className="logout-btn-nav" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/boards" element={<Boards boards={boards} />} />
            <Route path="/board/:id" element={<BoardPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}