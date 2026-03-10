const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

console.log('Starting HallWay server...');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"]
  }
});


const admin = require('firebase-admin');

// Handle Firebase Service Account for Render / Local
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {
    console.error("CRITICAL: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var is missing.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "my-student-network-backend.firebasestorage.app"
  });
}


const bucket = admin.storage().bucket();

// middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ["http://localhost:5173", "http://localhost:3000"]
}));
app.use(express.json());

// ─────────────────────────────────────────────
//  PERSISTENT JSON STORAGE
// ─────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DB_PATHS = {
  boards: path.join(DATA_DIR, 'boards.json'),
  posts: path.join(DATA_DIR, 'posts.json'),
  friendships: path.join(DATA_DIR, 'friendships.json'),
  notifications: path.join(DATA_DIR, 'notifications.json'),
  users: path.join(DATA_DIR, 'users.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
};

const DEFAULT_BOARDS = [
  { id: 1, name: 'Computer Science', description: 'Discuss algorithms, frameworks, and career paths in tech.', members: 1240, category: 'Academic', icon: 'tech', createdBy: 'system' },
  { id: 2, name: 'Funny Student Life', description: 'The place to share memes and jokes about our daily struggles.', members: 5600, category: 'Social', icon: 'fun', createdBy: 'system' },
  { id: 3, name: 'University Events', description: 'Upcoming parties, hackathons, and guest lectures.', members: 3100, category: 'Events', icon: 'event', createdBy: 'system' },
  { id: 4, name: 'Dorm Cooking', description: 'Recipes for those surviving on induction cookers and instant ramen.', members: 890, category: 'Lifestyle', icon: 'food', createdBy: 'system' },
  { id: 5, name: 'Study Partners', description: 'Find help for exams or join a focus study group.', members: 2450, category: 'Academic', icon: 'study', createdBy: 'system' },
];

const DEFAULT_POSTS = [
  { id: 1, boardId: 1, text: "Welcome to IT board!", userId: "system", userEmail: "system@hallway.com", displayName: "HallWay", likes: [], comments: [], createdAt: new Date().toISOString() }
];

function loadDB(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`Failed to load ${filePath}:`, e.message);
  }
  return defaultValue;
}

function saveDB(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Failed to save ${filePath}:`, e.message);
  }
}

// Load all data from disk on startup
let boards = loadDB(DB_PATHS.boards, DEFAULT_BOARDS);
let posts = loadDB(DB_PATHS.posts, DEFAULT_POSTS);
let friendships = loadDB(DB_PATHS.friendships, []);
let notifications = loadDB(DB_PATHS.notifications, []);
let users = loadDB(DB_PATHS.users, {});
let messages = loadDB(DB_PATHS.messages, []);
let onlineUsers = new Map(); // userId → socketId (always in-memory, resets on restart)

// Auto-save every 30 seconds as a safety net
setInterval(() => {
  saveDB(DB_PATHS.boards, boards);
  saveDB(DB_PATHS.posts, posts);
  saveDB(DB_PATHS.friendships, friendships);
  saveDB(DB_PATHS.notifications, notifications);
  saveDB(DB_PATHS.users, users);
  saveDB(DB_PATHS.messages, messages);
}, 30_000);

// ─────────────────────────────────────────────
//  BOARD ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/boards', (req, res) => {
  res.json(boards);
});

app.post('/api/boards', (req, res) => {
  const { name, description, category, createdBy } = req.body;
  const newBoard = {
    id: (boards.reduce((m, b) => Math.max(m, b.id), 0)) + 1,
    name,
    description,
    category: category || 'General',
    members: 1,
    icon: 'group',
    createdBy: createdBy || "system"
  };
  boards.push(newBoard);
  saveDB(DB_PATHS.boards, boards);
  res.json(newBoard);
});

app.put('/api/boards/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const board = boards.find(b => b.id === id);
  if (!board) return res.status(404).json({ error: "Board not found" });
  if (name) board.name = name;
  if (description) board.description = description;
  saveDB(DB_PATHS.boards, boards);
  res.json({ success: true, board });
});

app.delete('/api/boards/:id', (req, res) => {
  const id = Number(req.params.id);
  boards = boards.filter(b => b.id !== id);
  saveDB(DB_PATHS.boards, boards);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
//  POST ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/posts', (req, res) => {
  const boardId = Number(req.query.boardId);
  res.json(posts.filter(p => p.boardId === boardId));
});

app.post('/api/posts', (req, res) => {
  const { boardId, text, imageUrl, userId, userEmail, displayName } = req.body;
  const newPost = {
    id: (posts.reduce((m, p) => Math.max(m, p.id), 0)) + 1,
    boardId: Number(boardId),
    text,
    imageUrl: imageUrl || null,
    userId,
    userEmail,
    displayName: displayName || null,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  saveDB(DB_PATHS.posts, posts);
  io.emit('new_post', newPost);
  res.json(newPost);
});

// ─────────────────────────────────────────────
//  INTERACTION ENDPOINTS
// ─────────────────────────────────────────────
app.post('/api/posts/:id/like', (req, res) => {
  const postId = Number(req.params.id);
  const { userId, fromName } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
    if (post.userId !== userId) {
      const notif = {
        id: Date.now(), type: 'like', from: userId, to: post.userId,
        fromName: fromName || 'Someone', postId, status: 'unread',
        timestamp: new Date().toISOString()
      };
      notifications.push(notif);
      saveDB(DB_PATHS.notifications, notifications);
      const targetSocket = onlineUsers.get(post.userId);
      if (targetSocket) io.to(targetSocket).emit('notification', notif);
    }
  }
  saveDB(DB_PATHS.posts, posts);
  res.json({ likes: post.likes });
});

app.post('/api/posts/:id/comment', (req, res) => {
  const postId = Number(req.params.id);
  const { userId, userEmail, displayName, text } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const comment = {
    id: post.comments.length + 1, userId, userEmail, displayName,
    text, createdAt: new Date().toISOString()
  };
  post.comments.push(comment);

  if (post.userId !== userId) {
    const notif = {
      id: Date.now(), type: 'comment', from: userId, to: post.userId,
      fromName: displayName || userEmail?.split('@')[0] || 'Someone',
      postId, status: 'unread', timestamp: new Date().toISOString()
    };
    notifications.push(notif);
    saveDB(DB_PATHS.notifications, notifications);
    const targetSocket = onlineUsers.get(post.userId);
    if (targetSocket) io.to(targetSocket).emit('notification', notif);
  }
  saveDB(DB_PATHS.posts, posts);
  res.json(comment);
});

app.delete('/api/posts/:id', async (req, res) => {
  const postId = Number(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.imageUrl) {
    try {
      const urlPart = post.imageUrl.split("/o/")[1]?.split("?")[0];
      if (urlPart) await bucket.file(decodeURIComponent(urlPart)).delete();
    } catch (err) { console.log("Image delete error:", err.message); }
  }
  posts = posts.filter(p => p.id !== postId);
  saveDB(DB_PATHS.posts, posts);
  res.json({ success: true });
});

app.put('/api/posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const { text } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.text = text;
  saveDB(DB_PATHS.posts, posts);
  res.json({ success: true, post });
});

// ─────────────────────────────────────────────
//  SOCIAL ENDPOINTS
// ─────────────────────────────────────────────
app.post('/api/friends/request', (req, res) => {
  const { from, to, fromName } = req.body;
  const alreadyFriends = friendships.find(f =>
    (f.user1 === from && f.user2 === to) || (f.user1 === to && f.user2 === from)
  );
  if (!alreadyFriends) {
    const newNotif = {
      id: Date.now(), type: 'friend_request', from, to,
      fromName: fromName || from, status: 'unread',
      timestamp: new Date().toISOString()
    };
    notifications.push(newNotif);
    saveDB(DB_PATHS.notifications, notifications);
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('notification', newNotif);
  }
  res.json({ success: true });
});

app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(notifications.filter(n => n.to === userId));
});

app.post('/api/notifications/:id/accept', (req, res) => {
  const notifId = Number(req.params.id);
  const notif = notifications.find(n => n.id === notifId);
  if (notif && notif.type === 'friend_request') {
    notif.status = 'accepted';
    // Avoid duplicate friendships
    const exists = friendships.find(f =>
      (f.user1 === notif.from && f.user2 === notif.to) ||
      (f.user1 === notif.to && f.user2 === notif.from)
    );
    if (!exists) {
      friendships.push({ user1: notif.from, user2: notif.to });
      saveDB(DB_PATHS.friendships, friendships);
    }
    saveDB(DB_PATHS.notifications, notifications);
    io.emit('friendship_updated', { user1: notif.from, user2: notif.to });
  }
  res.json({ success: true });
});

app.post('/api/notifications/:id/clear', (req, res) => {
  const notifId = Number(req.params.id);
  notifications = notifications.filter(n => n.id !== notifId);
  saveDB(DB_PATHS.notifications, notifications);
  res.json({ success: true });
});

app.post('/api/users/profile', (req, res) => {
  const { userId, displayName, photoURL, email } = req.body;
  users[userId] = { ...users[userId], displayName, photoURL, email };
  saveDB(DB_PATHS.users, users);
  res.json({ success: true });
});

app.get('/api/friends/:userId', (req, res) => {
  const { userId } = req.params;
  const userFriends = friendships
    .filter(f => f.user1 === userId || f.user2 === userId)
    .map(f => f.user1 === userId ? f.user2 : f.user1);

  const friendsWithStatus = userFriends.map(fId => {
    const profile = users[fId] || {};
    return {
      id: fId,
      displayName: profile.displayName || profile.email?.split('@')[0] || 'HallWay User',
      photoURL: profile.photoURL || null,
      email: profile.email || '',
      status: onlineUsers.has(fId) ? 'online' : 'offline'
    };
  });
  res.json(friendsWithStatus);
});

app.get('/api/user-stats/:userId', (req, res) => {
  const userId = req.params.userId;
  const userPosts = posts.filter(p => p.userId === userId);
  const totalReceivedLikes = userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const friendCount = friendships.filter(f => f.user1 === userId || f.user2 === userId).length;
  res.json({
    posts: userPosts.length,
    boards: new Set(userPosts.map(p => p.boardId)).size,
    likes: totalReceivedLikes,
    friends: friendCount,
    profile: users[userId] || {}
  });
});

app.get('/api/recent-posts', (req, res) => {
  res.json([...posts].reverse().slice(0, 5));
});

// ─────────────────────────────────────────────
//  CHAT ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const convo = messages.filter(m =>
    (m.from === user1 && m.to === user2) || (m.from === user2 && m.to === user1)
  );
  res.json(convo);
});

app.post('/api/messages', (req, res) => {
  const { from, to, text, fromName } = req.body;
  const msg = { id: Date.now(), from, to, text, fromName, timestamp: new Date().toISOString() };
  messages.push(msg);
  saveDB(DB_PATHS.messages, messages);

  const targetSocket = onlineUsers.get(to);
  if (targetSocket) {
    io.to(targetSocket).emit('receive_message', msg);
    const notif = {
      id: Date.now() + 1, type: 'message', from, to,
      fromName: fromName || 'Someone', status: 'unread', timestamp: msg.timestamp
    };
    notifications.push(notif);
    saveDB(DB_PATHS.notifications, notifications);
    io.to(targetSocket).emit('notification', notif);
  }
  res.json(msg);
});

// ─────────────────────────────────────────────
//  SOCKET EVENTS
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join_hallway', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_status_change', { userId, status: 'online' });
  });

  socket.on('typing', ({ boardId, userName }) => {
    socket.broadcast.emit('user_typing', { boardId, userName });
  });

  socket.on('disconnect', () => {
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        io.emit('online_status_change', { userId: uid, status: 'offline' });
        break;
      }
    }
  });
});

// Graceful shutdown — save everything before exit
process.on('SIGINT', () => {
  console.log('\nSaving data before shutdown...');
  saveDB(DB_PATHS.boards, boards);
  saveDB(DB_PATHS.posts, posts);
  saveDB(DB_PATHS.friendships, friendships);
  saveDB(DB_PATHS.notifications, notifications);
  saveDB(DB_PATHS.users, users);
  saveDB(DB_PATHS.messages, messages);
  process.exit(0);
});

server.listen(PORT, () => console.log(`✅ HallWay server running on http://localhost:${PORT}`));