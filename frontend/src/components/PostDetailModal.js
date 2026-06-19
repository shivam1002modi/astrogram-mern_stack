import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';

const ModalContent = ({ post, onClose }) => {
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!post || !post.user) {
    return (
      <div className="post-detail-modal-overlay" onClick={onClose}>
        <button className="close-modal-btn" onClick={onClose}>×</button>
        <div className="post-detail-modal-content" onClick={handleModalContentClick} style={{ height: 'auto', minHeight: '200px', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>
            Post not found or author has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-modal-overlay" onClick={onClose}>
      <button className="close-modal-btn" onClick={onClose}>×</button>
      
      <div className="post-detail-modal-content" onClick={handleModalContentClick}>
        
        <div className="post-detail-image-container">
          <img src={post.imageUrl} alt={post.title} className="post-detail-image" />
        </div>

        <div className="post-detail-info-container">
          <div className="post-detail-header">
            <Link to={`/profile/${post.user._id}`} className="author-link" onClick={onClose}>
              <img
                src={post.user.profilePicture || `https://placehold.co/40x40/0a0826/e0e0ff?text=${post.user.name.charAt(0)}`}
                alt={post.user.name}
                className="author-avatar"
              />
              <span className="author-name">{post.user.name}</span>
            </Link>
          </div>
          
          <div className="post-detail-comments">
            <div className="post-detail-text">
              <p className="post-description">
                <strong>{post.user.name}</strong> {post.description}
              </p>
            </div>
            <CommentSection postId={post._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PostDetailModal({ postId, onClose }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postId) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [postId]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:5001/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post details:", err);
        setError("Could not load post.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (!postId) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  if (loading) {
    return ReactDOM.createPortal(
      <div className="post-detail-modal-overlay">
        <div className="post-detail-modal-content" style={{ height: '200px', justifyContent: 'center', alignItems: 'center' }}>
           <p>Loading post...</p>
        </div>
      </div>,
      modalRoot
    );
  }

  return ReactDOM.createPortal(
    <ModalContent post={post} onClose={onClose} />,
    modalRoot
  );
}