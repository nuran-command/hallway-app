import React from 'react';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Boards from './components/Boards';
import BoardPage from './components/BoardPage';

function App() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/boards')
      .then(res => res.json())
      .then(data => setBoards(data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Network</h1>
      <Routes>
        <Route path="/" element={<Boards boards={boards} />} />
        <Route path="/board/:id" element={<BoardPage />} />
      </Routes>
    </div>
  );
}

export default App;