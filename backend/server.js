const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;
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

const db = admin.firestore();
const bucket = admin.storage().bucket();

// middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ["http://localhost:5173", "http://localhost:3000"]
}));
app.use(express.json());

// ─────────────────────────────────────────────
//  HELPER FUNCTIONS
// ─────────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

// ─────────────────────────────────────────────
//  BOARD ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/boards', async (req, res) => {
  try {
    const snapshot = await db.collection('boards').get();
    let boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // If no boards, Return empty or default
    res.json(boards);
  } catch (err) {
    console.error("GET /api/boards Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boards', async (req, res) => {
  try {
    const { name, description, category, createdBy } = req.body;
    const newBoard = {
      name,
      description,
      category: category || 'General',
      members: 1,
      icon: 'group',
      createdBy: createdBy || "system",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('boards').add(newBoard);
    res.json({ id: docRef.id, ...newBoard });
  } catch (err) {
    console.error("POST /api/boards Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  POST ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/posts', async (req, res) => {
  try {
    const boardId = req.query.boardId;
    if (!boardId) return res.json([]);

    // Simplified query to avoid Composite Index error on start
    const snapshot = await db.collection('posts')
      .where('boardId', '==', boardId)
      .get();

    let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Manual sort if index is not ready
    posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { boardId, text, imageUrl, userId, userEmail, displayName } = req.body;
    const newPost = {
      boardId,
      text,
      imageUrl: imageUrl || null,
      userId,
      userEmail,
      displayName: displayName || null,
      likes: [],
      comments: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('posts').add(newPost);
    const savedPost = { id: docRef.id, ...newPost };
    io.emit('new_post', savedPost);
    res.json(savedPost);
  } catch (err) {
    console.error("POST /api/posts Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  INTERACTION ENDPOINTS
// ─────────────────────────────────────────────
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, fromName } = req.body;
    const postRef = db.collection('posts').doc(postId);
    const post = await postRef.get();

    if (!post.exists) return res.status(404).json({ error: "Post not found" });

    let likes = post.data().likes || [];
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
      // Create notification
      if (post.data().userId !== userId) {
        const notif = {
          type: 'like', from: userId, to: post.data().userId,
          fromName: fromName || 'Someone', postId, status: 'unread',
          timestamp: new Date().toISOString()
        };
        await db.collection('notifications').add(notif);
        const targetSocket = onlineUsers.get(post.data().userId);
        if (targetSocket) io.to(targetSocket).emit('notification', notif);
      }
    }
    await postRef.update({ likes });
    res.json({ likes });
  } catch (err) {
    console.error("LIKE Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, userEmail, displayName, text } = req.body;
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return res.status(404).json({ error: "Post not found" });

    const comment = {
      id: Date.now(), userId, userEmail, displayName,
      text, createdAt: new Date().toISOString()
    };

    await postRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(comment)
    });

    if (postDoc.data().userId !== userId) {
      const notif = {
        type: 'comment', from: userId, to: postDoc.data().userId,
        fromName: displayName || userEmail?.split('@')[0] || 'Someone',
        postId, status: 'unread', timestamp: new Date().toISOString()
      };
      await db.collection('notifications').add(notif);
      const targetSocket = onlineUsers.get(postDoc.data().userId);
      if (targetSocket) io.to(targetSocket).emit('notification', notif);
    }
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  SOCIAL ENDPOINTS
// ─────────────────────────────────────────────
app.post('/api/friends/request', async (req, res) => {
  try {
    const { from, to, fromName } = req.body;
    const newNotif = {
      type: 'friend_request', from, to,
      fromName: fromName || from, status: 'unread',
      timestamp: new Date().toISOString()
    };
    await db.collection('notifications').add(newNotif);
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) io.to(targetSocket).emit('notification', newNotif);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('to', '==', req.params.userId)
      .limit(20)
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/:id/accept', async (req, res) => {
  try {
    const notifRef = db.collection('notifications').doc(req.params.id);
    const notif = await notifRef.get();
    if (notif.exists && notif.data().type === 'friend_request') {
      await notifRef.update({ status: 'accepted' });
      await db.collection('friendships').add({
        user1: notif.data().from,
        user2: notif.data().to,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      io.emit('friendship_updated', { user1: notif.data().from, user2: notif.data().to });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/profile', async (req, res) => {
  try {
    const { userId, displayName, photoURL, email } = req.body;
    await db.collection('users').doc(userId).set({
      displayName, photoURL, email,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/friends/:userId', async (req, res) => {
  try {
    const uid = req.params.userId;
    const s1 = await db.collection('friendships').where('user1', '==', uid).get();
    const s2 = await db.collection('friendships').where('user2', '==', uid).get();

    const friendIds = [
      ...s1.docs.map(d => d.data().user2),
      ...s2.docs.map(d => d.data().user1)
    ];

    const friends = [];
    for (const fId of friendIds) {
      const uDoc = await db.collection('users').doc(fId).get();
      const profile = uDoc.data() || {};
      friends.push({
        id: fId,
        displayName: profile.displayName || profile.email?.split('@')[0] || 'HallWay User',
        photoURL: profile.photoURL || null,
        email: profile.email || '',
        status: onlineUsers.has(fId) ? 'online' : 'offline'
      });
    }
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const uid = req.params.userId;
    const postsSnap = await db.collection('posts').where('userId', '==', uid).get();
    const userDoc = await db.collection('users').doc(uid).get();

    res.json({
      posts: postsSnap.size,
      likes: postsSnap.docs.reduce((acc, d) => acc + (d.data().likes?.length || 0), 0),
      profile: userDoc.data() || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recent-posts', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(5).get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  CHAT ENDPOINTS
// ─────────────────────────────────────────────
app.get('/api/messages/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const s1 = await db.collection('messages')
      .where('from', '==', user1).where('to', '==', user2).get();
    const s2 = await db.collection('messages')
      .where('from', '==', user2).where('to', '==', user1).get();

    const messages = [...s1.docs, ...s2.docs]
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { from, to, text, fromName } = req.body;
    const msg = {
      from, to, text, fromName,
      timestamp: new Date().toISOString()
    };
    const docRef = await db.collection('messages').add(msg);
    const savedMsg = { id: docRef.id, ...msg };

    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('receive_message', savedMsg);
      const notif = {
        type: 'message', from, to,
        fromName: fromName || 'Someone', status: 'unread', timestamp: msg.timestamp
      };
      await db.collection('notifications').add(notif);
      io.to(targetSocket).emit('notification', notif);
    }
    res.json(savedMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  SOCKET EVENTS
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join_hallway', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_status_change', { userId, status: 'online' });
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

server.listen(PORT, () => console.log(`✅ HallWay server running on Port ${PORT}`));