import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Reusable Components
import PostList from '../components/PostList';
import LikersModal from '../components/LikersModal';
import PostDetailModal from '../components/PostDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // State for modals
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [selectedPostLikerIds, setSelectedPostLikerIds] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchHomeFeed = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        // **THE CHANGE**: Fetch from the new /home endpoint for the friends-only feed
        const res = await axios.get('http://localhost:5001/api/posts/home', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch home feed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeFeed();

    const socket = io('http://localhost:5001');
    socket.on('new_post', (newPost) => {
        // We can add more logic here later to check if the new post is from a friend.
        // For now, we'll just optimistically add it to the top.
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    });
    socket.on('post_deleted', (deletedPostId) => {
        setPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPostId));
    });
    return () => socket.disconnect();
  }, [currentUser]);

  const handleLike = async (postId) => {
    if (!currentUser) return toast.error('Please log in to like posts.');
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.put(`http://localhost:5001/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(posts.map(post => post._id === postId ? res.data : post));
    } catch (error) {
      toast.error('Failed to like post.');
    }
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:5001/api/posts/${postToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Post deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete post.");
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center' }}>Loading Home Feed...</h2>;

  return (
    <div>
        <PostList
            posts={posts}
            onLike={handleLike}
            onDelete={openDeleteModal}
            onViewComments={setSelectedPostId}
            onViewLikers={(likerIds) => {
                setSelectedPostLikerIds(likerIds);
                setIsLikersModalOpen(true);
            }}
            emptyFeedMessage="Your home feed is quiet. Find friends to see their posts here!"
        />

        {/* Modals */}
        <LikersModal isOpen={isLikersModalOpen} onClose={() => setIsLikersModalOpen(false)} likerIds={selectedPostLikerIds} />
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Post"
            message="Are you sure you want to permanently delete this post?"
        />
    </div>
  );
}

