import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function BoardPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/api/posts?boardId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.log(err));
  }, [id]);

  const createPost = () => {
    fetch(`http://localhost:3000/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: id, text })
    })
      .then(res => res.json())
      .then(newPost => setPosts([...posts, newPost]));
    
    setText("");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Board #{id}</h2>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a post..."
      />
      <button onClick={createPost}>Send</button>

      <ul>
        {posts.map(p => (
          <li key={p.id}>{p.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default BoardPage;