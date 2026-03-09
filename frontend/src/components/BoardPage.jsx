import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";
import { FaHashtag, FaImage, FaTrash, FaThumbsUp, FaRegComment, FaShareAlt, FaArrowLeft } from "react-icons/fa";

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
      setPosts(data.reverse()); // Show newest first
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
      setPosts([newPost, ...posts]);
      setText("");
      setFile(null);
    } catch (err) {
      console.log("Post creation error:", err);
      setError("Failed to create post. Please try again.");
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
    <div className="board-page-container">
      <div className="board-header">
        <Link to="/boards" className="view-all" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FaArrowLeft /> Back to Boards
        </Link>
        <h2><FaHashtag /> <span>Board #{id}</span></h2>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card post-create-card">
        <div className="post-input-wrapper">
          <textarea
            className="post-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind?"
          />
          {file && (
            <div className="file-name-preview">
              Selected: {file.name}
            </div>
          )}
        </div>

        <div className="post-actions">
          <label className="file-input-label">
            <FaImage /> Photo
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </label>
          <button onClick={createPost} disabled={loading || (!text && !file)} className="create-btn">
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      <div className="posts-feed">
        {posts.map(p => (
          <div key={p.id} className="card post-card">
            <div className="post-author-info">
              <div className="post-author-avatar">
                {p.userEmail[0].toUpperCase()}
              </div>
              <div className="post-author-details">
                <span className="post-author-name">{p.userEmail}</span>
                <span className="post-time">Just now</span>
              </div>
            </div>

            <div className="post-content">
              {p.text}
            </div>

            {p.imageUrl && (
              <div className="post-media">
                <img src={p.imageUrl} alt="Post content" />
              </div>
            )}

            <div className="post-footer">
              <div className="post-interaction">
                <button className="interaction-btn"><FaThumbsUp /> Like</button>
                <button className="interaction-btn"><FaRegComment /> Comment</button>
                <button className="interaction-btn"><FaShareAlt /> Share</button>
              </div>

              {auth.currentUser?.uid === p.userId && (
                <button className="delete-post-btn" onClick={() => deletePost(p.id)}>
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardPage;