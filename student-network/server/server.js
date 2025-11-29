const express = require('express');
const cors = require('cors');

console.log('Starting server...');

const app = express();
const PORT = 3000;

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
  const { boardId, text, imageUrl } = req.body;

  const newPost = {
    id: posts.length + 1,
    boardId: Number(boardId),
    text,
    imageUrl: imageUrl || null
  };

  posts.push(newPost);
  res.json(newPost);
});

// удалить пост по id
app.delete('/api/posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  posts = posts.filter(p => p.id !== postId);
  res.json({ success: true });
});

// запуск
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});