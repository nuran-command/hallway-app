import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPaperPlane, FaCircle, FaComments, FaArrowLeft } from 'react-icons/fa';
import { auth } from '../firebase';
import { API_URL } from '../config';
import './ChatPage.css';

export default function ChatPage({ socket }) {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [activeFriend, setActiveFriend] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const isUrl = (str) => str && (str.startsWith('http') || str.startsWith('blob:'));

    useEffect(() => {
        if (!currentUser) return;
        fetch(`${API_URL}/api/friends/${currentUser.uid}`)
            .then(r => r.json())
            .then(data => {
                setFriends(data);
                if (friendId) {
                    const found = data.find(f => f.id === friendId);
                    if (found) setActiveFriend(found);
                } else if (data.length > 0 && !friendId) {
                    setActiveFriend(data[0]);
                    navigate(`/chat/${data[0].id}`, { replace: true });
                }
            });
    }, [currentUser, friendId]);

    useEffect(() => {
        if (!activeFriend || !currentUser) return;
        setLoading(true);
        fetch(`${API_URL}/api/messages/${currentUser.uid}/${activeFriend.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(e => { console.error("Chat Fetch Fail:", e); setLoading(false); });
    }, [activeFriend]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        socket.on('receive_message', (msg) => {
            if (msg.from === activeFriend?.id || msg.to === activeFriend?.id) {
                setMessages(prev => [...prev, msg]);
            }
        });
        return () => socket.off('receive_message');
    }, [socket, activeFriend]);

    const sendMessage = async () => {
        if (!inputText.trim() || !activeFriend) return;
        const payload = {
            from: currentUser.uid,
            to: activeFriend.id,
            text: inputText.trim(),
            fromName: currentUser.displayName || currentUser.email?.split('@')[0]
        };
        const res = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setInputText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const selectFriend = (f) => {
        setActiveFriend(f);
        navigate(`/chat/${f.id}`);
    };

    return (
        <div className="chat-container">
            {/* Sidebar: friend list */}
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <FaComments className="header-icon" />
                    <h3>Messages</h3>
                </div>
                <div className="chat-friend-list">
                    {friends.length === 0 && (
                        <p className="chat-empty-hint">Add friends to start chatting!</p>
                    )}
                    {friends.map(f => (
                        <div
                            key={f.id}
                            className={`chat-friend-item ${activeFriend?.id === f.id ? 'active-chat' : ''}`}
                            onClick={() => selectFriend(f)}
                        >
                            <div className="chat-avatar">
                                {isUrl(f.photoURL) ? (
                                    <img src={f.photoURL} alt="avatar" />
                                ) : (
                                    <span>{f.displayName ? f.displayName[0].toUpperCase() : '?'}</span>
                                )}
                                <FaCircle className={`chat-status-dot ${f.status}`} />
                            </div>
                            <div className="chat-friend-info">
                                <strong>{f.displayName || 'HallWay User'}</strong>
                                <span className="chat-status-label">{f.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main chat area */}
            <div className="chat-main">
                {activeFriend ? (
                    <>
                        <div className="chat-topbar">
                            <div className="chat-avatar" style={{ width: 40, height: 40 }}>
                                {isUrl(activeFriend.photoURL) ? (
                                    <img src={activeFriend.photoURL} alt="" />
                                ) : (
                                    <span>{activeFriend.displayName?.[0]?.toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div>
                                <strong>{activeFriend.displayName || 'HallWay User'}</strong>
                                <p className={`chat-status-label ${activeFriend.status}`}>{activeFriend.status}</p>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {loading && <p className="chat-empty-hint">Loading messages...</p>}
                            {!loading && messages.length === 0 && (
                                <div className="chat-no-messages">
                                    <FaComments style={{ fontSize: '3rem', opacity: 0.15 }} />
                                    <p>No messages yet. Say hello! 👋</p>
                                </div>
                            )}
                            {messages.map(m => (
                                <div key={m.id} className={`chat-bubble ${m.from === currentUser.uid ? 'outgoing' : 'incoming'}`}>
                                    <div className="bubble-text">{m.text}</div>
                                    <span className="bubble-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-bar">
                            <input
                                className="chat-input"
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="chat-send-btn" onClick={sendMessage} disabled={!inputText.trim()}>
                                <FaPaperPlane />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <FaComments style={{ fontSize: '5rem', opacity: 0.1 }} />
                        <h3>Select a conversation</h3>
                        <p>Choose a friend from the list to start chatting</p>
                        <Link to="/boards" className="create-btn" style={{ marginTop: 16, display: 'inline-block', padding: '12px 24px' }}>Browse Boards</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
