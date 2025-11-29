import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // настроенный Firebase

function BoardPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Загрузка постов
  const loadPosts = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/posts?boardId=${id}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.log("Failed to load posts:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [id]);

  // Создание нового поста
  const createPost = async () => {
    if (!text && !file) return;
    setLoading(true);
    setError("");

    let imageUrl = null;
    try {
      if (file) {
        const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }

      const newPostData = { boardId: id, text, imageUrl };

      const res = await fetch(`http://localhost:3000/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });

      const newPost = await res.json();
      setPosts([...posts, newPost]);
      setText("");
      setFile(null);
    } catch (err) {
      console.log("Post creation error:", err);
      setError("Failed to send post. Check Firebase rules or network.");
    } finally {
      setLoading(false);
    }
  };

  // Удаление поста
  const deletePost = async (postId) => {
    try {
      await fetch(`http://localhost:3000/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.log("Delete error:", err);
      setError("Failed to delete post.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Board #{id}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a post..."
      /><br/>

      <input type="file" onChange={e => setFile(e.target.files[0])} /><br/>

      <button onClick={createPost} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>

      <ul>
        {posts.map(p => (
          <li key={p.id} style={{ marginBottom: "10px" }}>
            {p.text} <br />
            {p.imageUrl && <img src={p.imageUrl} alt="" width="200" />} <br />
            <button onClick={() => deletePost(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardPage;