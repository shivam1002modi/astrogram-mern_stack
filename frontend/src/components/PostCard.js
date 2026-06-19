import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Moved HeartIcon outside so it's not recreated on every render
const HeartIcon = ({ isLiked }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="heart-icon">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const getInitial = (name) => (name ? name.charAt(0) : '?');

export default function PostCard({ post, onLike, onDelete, onViewComments, onViewLikers }) {
  const { dbUser } = useAuth();

  if (!post.user) {
    return null;
  }

  const isLiked = dbUser ? post.likes.includes(dbUser._id) : false;
  const isAuthor = dbUser && dbUser._id === post.user._id;

  return (
    <div className="card post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`} className="author-link">
          <img src={post.user.profilePicture || `https://placehold.co/40x40/0a0826/e0e0ff?text=${getInitial(post.user.name)}`} alt={post.user.name} />
          <span className="author-name">{post.user.name}</span>
        </Link>
        {isAuthor && (
          <button className="delete-btn" onClick={() => onDelete(post)}>
            🗑️
          </button>
        )}
      </div>
      <img src={post.imageUrl} alt={post.title} className="post-image" />
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
        <div className="post-actions">
          <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={() => onLike(post._id)}>
            <HeartIcon isLiked={isLiked} />
          </button>
          <button className="like-count" onClick={() => onViewLikers(post.likes)}>
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </button>
        </div>
        <div className="view-comments-wrapper">
          <button className="view-comments-btn" onClick={() => onViewComments(post._id)}>
            View all comments
          </button>
        </div>
      </div>
    </div>
  );
}
