import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";

import "./BoardPage.css";

function BoardPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const createPost = async () => {
    if (!text && !file) return;
    setLoading(true);
    setError("");

    let imageUrl = null;

    try {
      if (file) {
        const fileRef = ref(storage, `images/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }

      const newPostData = {
        boardId: id,
        text,
        imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email
      };

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
      setError("Failed to send post.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="board-container">
  <h2 className="board-title">Board #{id}</h2>

  {error && <p className="error-text">{error}</p>}

  <div className="create-box">
    <input
      value={text}
      onChange={e => setText(e.target.value)}
      placeholder="Write a post..."
      type="text"
    />

    <input
      type="file"
      onChange={e => setFile(e.target.files[0])}
    />

    <button onClick={createPost} disabled={loading} className="create-btn">
      {loading ? "Sending..." : "Send"}
    </button>
  </div>

  <ul className="posts-grid">
    {posts.map(p => (
      <li key={p.id} className="post-card">
        <b>{p.userEmail}</b>
        <p className="post-text">{p.text}</p>
        {p.imageUrl && <img src={p.imageUrl} alt="" className="post-image" />}

        {auth.currentUser?.uid === p.userId && (
          <button className="delete-btn" onClick={() => deletePost(p.id)}>
            Delete
          </button>
        )}
      </li>
    ))}
  </ul>
</div>
  );
}

export default BoardPage;