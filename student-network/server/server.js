const express = require('express');
const cors = require('cors');

console.log('Starting server...');

const app = express();
const PORT = 3000;

// middlewares
app.use(cors());
app.use(express.json());

// GET /api/boards — возвращает список досок
app.get('/api/boards', (req, res) => {
  res.json([
    { id: 1, name: 'IT' },
    { id: 2, name: 'Мемы' },
    { id: 3, name: 'Университет' }
  ]);
});

// POST /api/posts — пример публикации поста
app.post('/api/posts', (req, res) => {
  const { boardId, content } = req.body;
  // здесь логика добавления в Firebase (потом)
  res.json({ success: true, boardId, content });
});
// запустить сервер

let posts = [
  { id: 1, boardId: 1, text: "Welcome to IT board!" }
];

app.get('/api/posts', (req, res) => {
  const boardId = Number(req.query.boardId);
  res.json(posts.filter(p => p.boardId === boardId));
});

app.post('/api/posts', (req, res) => {
  const { boardId, text } = req.body;
  const newPost = { id: posts.length + 1, boardId: Number(boardId), text };
  posts.push(newPost);
  res.json(newPost);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});