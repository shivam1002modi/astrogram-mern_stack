import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

// Import Components
import ProfileHeader from '../components/ProfileHeader';
import PostList from '../components/PostList';
import LikersModal from '../components/LikersModal';
import PostDetailModal from '../components/PostDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { currentUser, dbUser } = useAuth();

  // State for modals
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [selectedPostLikerIds, setSelectedPostLikerIds] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5001/api/users/profile/${id}`);
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null); // Set profile to null on error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const socket = io('http://localhost:5001');

    socket.on('new_post', (newPost) => {
      // Only add the post if it belongs to the user whose profile we are viewing.
      if (newPost.user?._id === id) {
        setProfile(prevProfile => {
          if (!prevProfile) return null;
          return {
            ...prevProfile,
            posts: [newPost, ...prevProfile.posts] // Add the fully populated new post
          };
        });
      }
    });

    socket.on('post_deleted', (deletedPostId) => {
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          posts: prevProfile.posts.filter(p => p._id !== deletedPostId)
        };
      });
    });
    return () => socket.disconnect();
  }, [id]);

  const handleLike = async (postId) => {
    if (!currentUser) return toast.error('Please log in to like posts.');
    try {
      const token = await currentUser.getIdToken();
      // The like endpoint now returns the full, populated post object.
      const res = await axios.put(`http://localhost:5001/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        const updatedPosts = prevProfile.posts.map(p => p._id === postId ? res.data : p);
        return { ...prevProfile, posts: updatedPosts };
      });

    } catch (error) {
      console.error('Failed to like post:', error);
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
      // The socket event 'post_deleted' will handle the UI update for all users.
    } catch (error) {
      toast.error("Failed to delete post.");
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center' }}>Loading Profile...</h2>;
  if (!profile || !profile.user) return <h2 style={{ textAlign: 'center' }}>Profile not found.</h2>;

  return (
    <div>
      <ProfileHeader 
        user={profile.user}
        postCount={profile.posts.length}
        isOwnProfile={dbUser?._id === profile.user._id}
      />

      <h2 style={{ fontFamily: 'var(--font-primary)', textAlign: 'center', marginBottom: '2rem' }}>
        Posts by {profile.user.name}
      </h2>

      <PostList
        posts={profile.posts}
        onLike={handleLike}
        onDelete={openDeleteModal}
        onViewComments={setSelectedPostId}
        onViewLikers={(likerIds) => {
          setSelectedPostLikerIds(likerIds);
          setIsLikersModalOpen(true);
        }}
        emptyFeedMessage="This user has no posts yet."
      />
      
      {/* Modals */}
      <LikersModal isOpen={isLikersModalOpen} onClose={() => setIsLikersModalOpen(false)} likerIds={selectedPostLikerIds} />
      <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post and all its comments?"
      />
    </div>
  );
}
