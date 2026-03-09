const express = require('express');
const cors = require('cors');

console.log('Starting server...');

const app = express();
const PORT = 3000;

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

// тестовые доски
app.get('/api/boards', (req, res) => {
  res.json([
    { id: 1, name: 'IT' },
    { id: 2, name: 'Мемы' },
    { id: 3, name: 'Университет' }
  ]);
});

// временное хранение постов
let posts = [
  { id: 1, boardId: 1, text: "Welcome to IT board!", imageUrl: null }
];

// получить посты по доске
app.get('/api/posts', (req, res) => {
  const boardId = Number(req.query.boardId);
  res.json(posts.filter(p => p.boardId === boardId));
});

// создать пост
app.post('/api/posts', (req, res) => {
  const { boardId, text, imageUrl, userId, userEmail } = req.body;

  const newPost = {
    id: posts.length + 1,
    boardId: Number(boardId),
    text,
    imageUrl: imageUrl || null,
    userId,
    userEmail
  };

  posts.push(newPost);
  res.json(newPost);
});

// удалить пост по id
app.delete('/api/posts/:id', async (req, res) => {
  const postId = Number(req.params.id);
  const post = posts.find(p => p.id === postId);

  if (!post) return res.status(404).json({ error: "Post not found" });

  // Удаление картинки из Firebase
  if (post.imageUrl) {
    try {
      const urlPart = post.imageUrl.split("/o/")[1]?.split("?")[0];
      if (urlPart) {
        const filePath = decodeURIComponent(urlPart);
        console.log("Trying to delete file:", filePath);
        await bucket.file(filePath).delete();
        console.log("Image deleted from Firebase:", filePath);
      } else {
        console.log("Image URL format invalid, skipping delete");
      }
    } catch (err) {
      console.log("Image delete error:", err);
    }
  }

  // Удаляем пост из массива
  posts = posts.filter(p => p.id !== postId);

  res.json({ success: true });
});

// запуск
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});