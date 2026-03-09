import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";
import ReactMarkdown from 'react-markdown';
import Skeleton from './Skeleton';
import { FaHashtag, FaImage, FaTrash, FaThumbsUp, FaRegComment, FaShareAlt, FaArrowLeft, FaTimes, FaUserPlus } from "react-icons/fa";
import './BoardPage.css';

function BoardPage({ socket }) {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [friends, setFriends] = useState([]);

  const loadData = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts?boardId=${id}`);
      const data = await res.json();
      setPosts(data.reverse());

      if (auth.currentUser) {
        const friendsRes = await fetch(`http://localhost:3000/api/friends/${auth.currentUser.uid}`);
        const friendsData = await friendsRes.json();
        setFriends(friendsData);
      }
    } catch (err) {
      console.log("Failed to load data:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadData();

    // Socket listeners
    socket.on('new_post', (post) => {
      if (Number(post.boardId) === Number(id)) {
        setPosts(prev => [post, ...prev]);
      }
    });

    socket.on('user_typing', ({ boardId, userName }) => {
      if (Number(boardId) === Number(id)) {
        setTypingUser(userName);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      socket.off('new_post');
      socket.off('user_typing');
    };
  }, [id, socket, auth.currentUser]);

  const handleAddFriend = async (toUserId) => {
    try {
      await fetch('http://localhost:3000/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: auth.currentUser.uid,
          to: toUserId,
          fromName: auth.currentUser.displayName || auth.currentUser.email
        })
      });
      alert('Friend request sent!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (socket && auth.currentUser) {
      socket.emit('typing', { boardId: id, userName: auth.currentUser.displayName || auth.currentUser.email });
    }
  };

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
        userEmail: auth.currentUser.email,
        displayName: auth.currentUser.displayName
      };

      await fetch(`http://localhost:3000/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });

      setText("");
      setFile(null);
    } catch (err) {
      console.log("Post creation error:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.currentUser.uid })
      });
      const data = await res.json();
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
    } catch (err) {
      console.log("Like error:", err);
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

  const addComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          text: commentText
        })
      });
      const newComment = await res.json();
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
    } catch (err) {
      console.log("Comment error:", err);
    }
  };

  return (
    <div className="board-page-container">
      <div className="board-header">
        <Link to="/boards" className="view-all" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FaArrowLeft /> Back to Boards
        </Link>
        <div className="header-flex">
          <h2><FaHashtag /> <span>Board #{id}</span></h2>
          {typingUser && <div className="typing-indicator">{typingUser} is typing...</div>}
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card post-create-card">
        <div className="post-input-wrapper">
          <textarea
            className="post-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Share something... (Markdown supported!)"
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
        {loadingPosts ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card post-card">
              <Skeleton height="150px" borderRadius="16px" />
            </div>
          ))
        ) : (
          posts.map(p => {
            const isLiked = p.likes?.includes(auth.currentUser.uid);
            return (
              <div key={p.id} className="card post-card">
                <div className="post-author-info">
                  <Link to={`/profile/${p.userId}`} className="post-author-avatar">
                    {p.displayName ? p.displayName[0].toUpperCase() : (p.userEmail ? p.userEmail[0].toUpperCase() : '?')}
                  </Link>
                  <div className="post-author-details">
                    <div className="post-author-header">
                      <Link to={`/profile/${p.userId}`} className="post-author-name">
                        {p.displayName || (p.userEmail ? p.userEmail.split('@')[0] : 'Anonymous')}
                      </Link>
                      {auth.currentUser && auth.currentUser.uid !== p.userId && !friends.some(f => f.id === p.userId) && (
                        <button className="add-friend-btn-post" onClick={() => handleAddFriend(p.userId)} title="Add Friend">
                          <FaUserPlus />
                        </button>
                      )}
                    </div>
                    <span className="post-time">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>

                <div className="post-content">
                  <ReactMarkdown>{p.text}</ReactMarkdown>
                </div>

                {p.imageUrl && (
                  <div className="post-media" onClick={() => setLightboxImg(p.imageUrl)}>
                    <img src={p.imageUrl} alt="Post content" />
                  </div>
                )}

                <div className="post-footer">
                  <div className="post-interaction">
                    <button
                      className={`interaction-btn ${isLiked ? 'active' : ''}`}
                      onClick={() => toggleLike(p.id)}
                    >
                      <FaThumbsUp /> {p.likes?.length || 0}
                    </button>
                    <button className="interaction-btn">
                      <FaRegComment /> {p.comments?.length || 0}
                    </button>
                    <button className="interaction-btn" onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }}>
                      <FaShareAlt /> Share
                    </button>
                  </div>

                  {auth.currentUser?.uid === p.userId && (
                    <button className="delete-post-btn" onClick={() => deletePost(p.id)}>
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>

                {/* Comment Section */}
                <div className="comment-section">
                  <div className="comment-list">
                    {p.comments?.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <strong>{comment.displayName || comment.userEmail?.split('@')[0] || 'Anonymous'}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-area">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addComment(p.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loadingPosts && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content">
            <img src={lightboxImg} alt="Enlarged view" />
            <button className="close-lightbox"><FaTimes /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardPage;