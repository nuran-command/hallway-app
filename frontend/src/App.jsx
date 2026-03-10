import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ChatPage from './components/ChatPage';
import TopHeader from './components/TopHeader';
import { useTheme, ThemeProvider } from './themeStore';
import './theme.css';
import './App.css';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { io } from 'socket.io-client';
import Onboarding from './components/Onboarding';
import { API_URL } from './config';

const socket = io(API_URL);

export default function App() {
  const [boards, setBoards] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    console.log("🚀 HallWay App Started");
    console.log("📍 API_URL:", API_URL);
    // Initial check for mobile sidebar state
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [theme]);


  React.useEffect(() => {
    if (!user || !socket) return;

    const onConnect = () => {
      console.log("Connected to server, joining hallway...");
      socket.emit('join_hallway', user.uid);
    };

    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    return () => socket.off('connect', onConnect);
  }, [user]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user info with backend
        fetch(`${API_URL}/api/users/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email
          })
        });
      }
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);


  const fetchBoards = () => {
    fetch(`${API_URL}/api/boards`)
      .then(async res => {
        if (!res.ok) {
          const someText = await res.text();
          console.error(`🚨 Backend Error (${res.status}):`, someText.slice(0, 50));
          return [];
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setBoards(data);
        }
      })
      .catch(err => console.error("🚨 Boards Fetch Failed:", err));
  };


  React.useEffect(() => {
    // Delay initial fetch slightly on localhost to give the backend time to start up
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const delay = isLocal ? 1500 : 0;

    setTimeout(() => {
      fetch(`${API_URL}/api/ping`).then(r => r.json()).then(d => console.log("API Status:", d)).catch(e => console.log("API Starting up..."));
      fetchBoards();
    }, delay);

    if (socket) {
      socket.on('board_created', fetchBoards);
      socket.on('board_updated', fetchBoards);
      socket.on('board_deleted', fetchBoards);
      socket.on('new_post', () => console.log('New post available'));
    }

    return () => {
      if (socket) {
        socket.off('board_created');
        socket.off('board_updated');
        socket.off('board_deleted');
        socket.off('new_post');
      }
    };
  }, [socket]);

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
      <Onboarding />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} />

      <main className="main-content">
        <TopHeader
          user={user}
          socket={socket}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard socket={socket} boards={boards} />} />
            <Route path="/boards" element={<Boards boards={Array.isArray(boards) ? boards : []} onBoardCreated={fetchBoards} />} />
            <Route path="/board/:id" element={<BoardPage socket={socket} boards={Array.isArray(boards) ? boards : []} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<ChatPage socket={socket} />} />
            <Route path="/chat/:friendId" element={<ChatPage socket={socket} />} />
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