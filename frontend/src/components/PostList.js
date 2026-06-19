import React from 'react';
import PostCard from './PostCard';

export default function PostList({ posts, onLike, onDelete, onViewComments, onViewLikers, emptyFeedMessage }) {
  if (!posts || posts.length === 0) {
    // **THE FIX**: Use the custom emptyFeedMessage prop, with a fallback.
    return <p style={{ textAlign: 'center' }}>{emptyFeedMessage || "No posts yet."}</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onDelete={onDelete}
          onViewComments={onViewComments}
          onViewLikers={onViewLikers}
        />
      ))}
    </div>
  );
}

