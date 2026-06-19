import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostGrid from '../components/PostGrid';
import PostDetailModal from '../components/PostDetailModal';

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    const fetchExploreFeed = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5001/api/posts/explore');
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch explore feed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreFeed();
  }, []);

  // This function is passed to the PostGrid and updates the state, triggering the modal
  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
  };

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  if (loading) return <h2 style={{ textAlign: 'center' }}>Exploring...</h2>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-primary)', textAlign: 'center', marginBottom: '2rem' }}>
        Explore Posts
      </h2>
      <PostGrid posts={posts} onPostClick={handlePostClick} />
      {/* The PostDetailModal is rendered here and its visibility is controlled by state */}
      <PostDetailModal postId={selectedPostId} onClose={handleCloseModal} />
    </div>
  );
}