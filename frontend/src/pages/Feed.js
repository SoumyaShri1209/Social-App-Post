import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts, likePost, commentOnPost, createPost, deletePost } from '../services/api';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [openComments, setOpenComments] = useState({});

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await fetchPosts();
      setPosts(data);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const getAvatarColor = (username) => {
    const colors = ['#3b82f6', '#1e40af', '#60a5fa', '#2563eb', '#0ea5e9'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleLike = async (postId, index) => {
    try {
      const { data } = await likePost(postId);
      const updated = [...posts];
      updated[index].likes = data.likes;
      setPosts(updated);
    } catch { toast.error('Like failed'); }
  };

  const handleComment = async (postId, text, index) => {
    if (!text.trim()) return toast.error('Write something');
    try {
      const { data } = await commentOnPost(postId, text);
      const updated = [...posts];
      updated[index].comments = data.comments;
      setPosts(updated);
      toast.success('Comment added');
      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch { toast.error('Comment failed'); }
  };

  const handleCreatePost = async () => {
    if (!newPostText && !newPostImage) return toast.error('Add text or image');
    setSubmitting(true);
    try {
      await createPost({ text: newPostText, imageUrl: newPostImage });
      toast.success('Post created!');
      setNewPostText('');
      setNewPostImage('');
      setShowCreate(false);
      loadPosts();
    } catch { toast.error('Failed to create post'); }
    finally { setSubmitting(false); }
  };

  const handleDeletePost = async (postId, index) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      const updated = [...posts];
      updated.splice(index, 1);
      setPosts(updated);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Skeleton Loader Component
  if (loading) {
    return (
      <div className="feed-container">
        <div className="navbar">
          <h2>Social Feed</h2>
          <span>Hi, {user.name || 'User'}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="posts">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-info">
                  <div className="skeleton-line" style={{ width: '120px' }}></div>
                  <div className="skeleton-line" style={{ width: '80px' }}></div>
                </div>
              </div>
              <div className="skeleton-line" style={{ width: '90%', margin: '12px 0 8px 56px' }}></div>
              <div className="skeleton-line" style={{ width: '70%', marginLeft: '56px' }}></div>
              <div className="skeleton-actions" style={{ marginTop: '16px', paddingLeft: '56px' }}>
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="navbar">
        <h2>Social Feed</h2>
        <span>Hi, {user.name}</span>
        <button onClick={handleLogout} className="logout-btn">
  🚪 Logout
</button>
      </div>

      <div className="posts">
        {posts.length === 0 && <div className="no-posts">No posts yet. Create one!</div>}
        <AnimatePresence>
          {posts.map((post, idx) => {
            const avatarInitial = post.username.charAt(0).toUpperCase();
            const avatarColor = getAvatarColor(post.username);
            const isCommentOpen = openComments[post._id] || false;

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                layout
              >
                <div className="post-card">
                  <div className="post-header">
                    <div className="avatar" style={{ background: avatarColor }}>
                      {avatarInitial}
                    </div>
                    <div className="post-info">
                      <strong>{post.username}</strong>
                      <small>{new Date(post.createdAt).toLocaleString()}</small>
                    </div>
                  </div>

                  <div className="post-content">{post.text}</div>
                  {post.imageUrl && <img src={post.imageUrl} alt="post" className="post-image" />}

                  <div className="post-actions">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleLike(post._id, idx)}
                      className={`like-btn ${post.likes.includes(user.name) ? 'active' : ''}`}
                    >
                      ❤️ {post.likes.length} likes
                    </motion.button>
                    <button onClick={() => setOpenComments({ ...openComments, [post._id]: !isCommentOpen })}>
                      💬 {post.comments.length} comments
                    </button>
                    {post.userId === user.id && (
                      <button onClick={() => handleDeletePost(post._id, idx)} className="delete-btn">
                        🗑️ Delete
                      </button>
                    )}
                  </div>

                  {isCommentOpen && (
                    <div className="comment-section">
                      {post.comments.length > 0 ? (
                        post.comments.map((c, i) => (
                          <div key={i} className="comment-item">
                            <strong>{c.username}</strong>
                            <span className="comment-text">{c.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-comments">No comments yet. Be the first!</div>
                      )}
                      <div className="add-comment">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                        />
                        <button onClick={() => handleComment(post._id, commentTexts[post._id] || '', idx)}>Post</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showCreate && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create Post</h3>
            <textarea
              placeholder="What's on your mind?"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
            <input
              placeholder="Image URL (optional)"
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)}>Cancel</button>
              <button onClick={handleCreatePost} disabled={submitting}>
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowCreate(true)}>+</button>
    </div>
  );
};

export default Feed;