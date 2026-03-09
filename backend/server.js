const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

console.log('Starting server...');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"]
  }
});

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "my-student-network-backend.firebasestorage.app"
});

const bucket = admin.storage().bucket();

// middlewares
app.use(cors());
app.use(express.json());

// In-memory data (In production, use a DB like Firestore or MongoDB)
let boards = [
  {
    id: 1,
    name: 'Computer Science',
    description: 'Discuss algorithms, frameworks, and career paths in tech.',
    members: 1240,
    category: 'Academic',
    icon: 'tech'
  },
  {
    id: 2,
    name: 'Funny Student Life',
    description: 'The place to share memes and jokes about our daily struggles.',
    members: 5600,
    category: 'Social',
    icon: 'fun'
  },
  {
    id: 3,
    name: 'University Events',
    description: 'Upcoming parties, hackathons, and guest lectures.',
    members: 3100,
    category: 'Events',
    icon: 'event'
  },
  {
    id: 4,
    name: 'Dorm Cooking',
    description: 'Recipes for those surviving on induction cookers and instant ramen.',
    members: 890,
    category: 'Lifestyle',
    icon: 'food'
  },
  {
    id: 5,
    name: 'Study Partners',
    description: 'Find help for exams or join a focus study group.',
    members: 2450,
    category: 'Academic',
    icon: 'study'
  }
];

let posts = [{ id: 1, boardId: 1, text: "Welcome to IT board!", userId: "system", userEmail: "system@hallway.com", likes: [], comments: [], createdAt: new Date().toISOString() }];

let friendships = []; // [{ user1: string, user2: string }]
let notifications = []; // [{ id, type, from, to, status, timestamp, fromName }]
let users = {};         // userId -> { displayName, photoURL, email }
let onlineUsers = new Map(); // userId -> socketId
let messages = [];           // [{ id, from, to, text, timestamp }]

// --- BOARD ENDPOINTS ---
app.get('/api/boards', (req, res) => {
  res.json(boards);
});

app.post('/api/boards', (req, res) => {
  const { name, description, category, createdBy } = req.body;
  const newBoard = {
    id: boards.length + 1,
    name,
    description,
    category: category || 'General',
    members: 1,
    icon: 'group',
    createdBy: createdBy || "system"
  };
  boards.push(newBoard);
  res.json(newBoard);
});

app.put('/api/boards/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const board = boards.find(b => b.id === id);
  if (!board) return res.status(404).json({ error: "Board not found" });
  if (name) board.name = name;
  if (description) board.description = description;
  res.json({ success: true, board });
});

app.delete('/api/boards/:id', (req, res) => {
  const id = Number(req.params.id);
  boards = boards.filter(b => b.id !== id);
  res.json({ success: true });
});


// --- POST ENDPOINTS ---
app.get('/api/posts', (req, res) => {
  const boardId = Number(req.query.boardId);
  res.json(posts.filter(p => p.boardId === boardId));
});

app.post('/api/posts', (req, res) => {
  const { boardId, text, imageUrl, userId, userEmail, displayName } = req.body;

  const newPost = {
    id: posts.length + 1,
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

  // Real-time notification
  io.emit('new_post', newPost);

  res.json(newPost);
});

// --- INTERACTION ENDPOINTS ---
app.post('/api/posts/:id/like', (req, res) => {
  const postId = Number(req.params.id);
  const { userId, fromName } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
    // Notify post owner if it's not the same user
    if (post.userId !== userId) {
      const notif = {
        id: Date.now(),
        type: 'like',
        from: userId,
        to: post.userId,
        fromName: fromName || 'Someone',
        postId,
        status: 'unread',
        timestamp: new Date().toISOString()
      };
      notifications.push(notif);
      const targetSocket = onlineUsers.get(post.userId);
      if (targetSocket) io.to(targetSocket).emit('notification', notif);
    }
  }
  res.json({ likes: post.likes });
});

app.post('/api/posts/:id/comment', (req, res) => {
  const postId = Number(req.params.id);
  const { userId, userEmail, displayName, text } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const comment = { id: post.comments.length + 1, userId, userEmail, displayName, text, createdAt: new Date().toISOString() };
  post.comments.push(comment);
  // Notify post owner if it's not the commenter themselves
  if (post.userId !== userId) {
    const notif = {
      id: Date.now(),
      type: 'comment',
      from: userId,
      to: post.userId,
      fromName: displayName || userEmail?.split('@')[0] || 'Someone',
      postId,
      status: 'unread',
      timestamp: new Date().toISOString()
    };
    notifications.push(notif);
    const targetSocket = onlineUsers.get(post.userId);
    if (targetSocket) io.to(targetSocket).emit('notification', notif);
  }
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
    } catch (err) { console.log("Image delete error:", err); }
  }
  posts = posts.filter(p => p.id !== postId);
  res.json({ success: true });
});

app.put('/api/posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const { text } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.text = text;
  res.json({ success: true, post });
});

// --- SOCIAL ENDPOINTS ---
app.post('/api/friends/request', (req, res) => {
  const { from, to, fromName } = req.body;
  if (!friendships.find(f => (f.user1 === from && f.user2 === to) || (f.user1 === to && f.user2 === from))) {
    // Add notification instead of direct friendship
    const newNotif = {
      id: Date.now(),
      type: 'friend_request',
      from,
      to,
      fromName: fromName || from,
      status: 'unread',
      timestamp: new Date().toISOString()
    };
    notifications.push(newNotif);

    // Emit real-time notification if target is online
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('notification', newNotif);
    }
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
    friendships.push({ user1: notif.from, user2: notif.to });
    io.emit('friendship_updated', { user1: notif.from, user2: notif.to });
    // Send notification back to the sender? Maybe later
  }
  res.json({ success: true });
});

app.post('/api/notifications/:id/clear', (req, res) => {
  const notifId = Number(req.params.id);
  notifications = notifications.filter(n => n.id !== notifId);
  res.json({ success: true });
});

app.post('/api/users/profile', (req, res) => {
  const { userId, displayName, photoURL, email } = req.body;
  users[userId] = { ...users[userId], displayName, photoURL, email };
  res.json({ success: true });
});

app.get('/api/friends/:userId', (req, res) => {
  const { userId } = req.params;
  const userFriends = friendships
    .filter(f => f.user1 === userId || f.user2 === userId)
    .map(f => f.user1 === userId ? f.user2 : f.user1);

  // Attach status and profile — use users registry, fallback gracefully
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
  res.json(posts.slice(-5).reverse());
});

// --- CHAT ENDPOINTS ---
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
  const targetSocket = onlineUsers.get(to);
  if (targetSocket) {
    io.to(targetSocket).emit('receive_message', msg);
    const notif = { id: Date.now() + 1, type: 'message', from, to, fromName: fromName || 'Someone', status: 'unread', timestamp: msg.timestamp };
    notifications.push(notif);
    io.to(targetSocket).emit('notification', notif);
  }
  res.json(msg);
});


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

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));