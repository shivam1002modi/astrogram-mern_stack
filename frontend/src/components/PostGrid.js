import React from 'react';

// A simple component to display a post as a thumbnail in the grid
const PostGridItem = ({ post, onPostClick }) => (
  // The onClick handler calls the function passed down from the ExplorePage
  <div className="post-grid-item" onClick={() => onPostClick(post._id)}>
    <img src={post.imageUrl} alt={post.title} />
    <div className="post-grid-item-overlay">
      <span>❤️ {post.likes.length}</span>
    </div>
  </div>
);

// The main grid component
export default function PostGrid({ posts, onPostClick }) {
  if (!posts || posts.length === 0) {
    return <p style={{ textAlign: 'center' }}>No posts to explore right now.</p>;
  }

  return (
    <div className="post-grid">
      {posts.map(post => (
        <PostGridItem key={post._id} post={post} onPostClick={onPostClick} />
      ))}
    </div>
  );
}

