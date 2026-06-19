import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal'; // Import the modal

// --- Reusable Components ---
const CommentForm = ({ onSubmit, placeholder, initialText = '', buttonText = 'Post' }) => {
  const [content, setContent] = useState(initialText);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="form-textarea"
        rows="2"
        required
      />
      <button type="submit" className="btn">{buttonText}</button>
    </form>
  );
};

const Comment = ({
  comment,
  replies,
  onReplySubmit,
  dbUser,
  currentUser,
  onVote,
  renderReplies,
  isExpanded,
  onToggleReplies,
  onDelete
}) => {
  const [isReplying, setIsReplying] = useState(false);

  if (!comment.user) {
    return (
      <div className="comment deleted-comment">
        <p className="comment-content"><em>This comment was by a user who no longer exists.</em></p>
      </div>
    );
  }

  const isAuthor = dbUser && comment.user && dbUser._id === comment.user._id;

  const userVote = () => {
    if (!dbUser) return null;
    if (comment.upvotes.includes(dbUser._id)) return 'like';
    if (comment.downvotes.includes(dbUser._id)) return 'dislike';
    return null;
  };

  const userInitial = comment.user.name ? comment.user.name.charAt(0) : '?';

  return (
    <div className="comment">
      <div className="comment-header">
        <img
          src={comment.user.profilePicture || `https://placehold.co/28x28/0a0826/e0e0ff?text=${userInitial}`}
          alt={comment.user.name || 'Deleted User'}
        />
        <strong>{comment.user.name || '[Deleted User]'}</strong>
        {/* Delete button for author */}
        {isAuthor && (
          <button className="delete-btn comment-delete-btn" onClick={() => onDelete(comment)}>
            🗑️
          </button>
        )}
      </div>
      <p className="comment-content">{comment.content}</p>
      <div className="comment-actions">
        <button
          className={`comment-action-btn vote-btn ${userVote() === 'like' ? 'active-like' : ''}`}
          onClick={() => onVote(comment._id, 'upvote')}
        >
          👍 {comment.upvotes.length}
        </button>
        <button
          className={`comment-action-btn vote-btn ${userVote() === 'dislike' ? 'active-dislike' : ''}`}
          onClick={() => onVote(comment._id, 'downvote')}
        >
          👎 {comment.downvotes.length}
        </button>
        {currentUser && (
          <button className="comment-action-btn reply-btn" onClick={() => setIsReplying(!isReplying)}>
            Reply
          </button>
        )}
      </div>
      {isReplying && (
        <div className="reply-form">
          <CommentForm
            onSubmit={(content) => {
              onReplySubmit(content, comment._id);
              setIsReplying(false);
            }}
            placeholder={`Replying to ${comment.user.name}...`}
            buttonText="Reply"
          />
        </div>
      )}
      {replies.length > 0 && (
        <button className="view-replies-btn" onClick={() => onToggleReplies(comment._id)}>
          {isExpanded ? 'Hide Replies' : `View ${replies.length} ${replies.length > 1 ? 'Replies' : 'Reply'}`}
        </button>
      )}
      {isExpanded && renderReplies(replies)}
    </div>
  );
};

// --- Main Component ---
export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { currentUser, dbUser } = useAuth();

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/comments/post/${postId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  const handleCommentSubmit = async (content, parentCommentId = null) => {
    if (!currentUser) return toast.error("You must be logged in to comment.");
    try {
      if (parentCommentId) {
        setExpandedComments(prev => new Set(prev).add(parentCommentId));
      }
      const token = await currentUser.getIdToken();
      const res = await axios.post('http://localhost:5001/api/comments',
        { postId, content, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prevComments => [...prevComments, res.data]);
    } catch (error) {
      toast.error("Failed to post comment.");
    }
  };

  const handleVote = async (commentId, voteType) => {
    if (!currentUser) return toast.error("You must be logged in to vote.");
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.put(`http://localhost:5001/api/comments/${commentId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(currentComments =>
        currentComments.map(c => c._id === commentId ? { ...c, ...res.data, user: c.user } : c)
      );
    } catch (error) {
      toast.error("Failed to vote.");
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Handle delete
  const openDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:5001/api/comments/${commentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete comment.");
    } finally {
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const buildAndRenderComments = (parentId = null) => {
    const childComments = comments.filter(c => c.parentComment === parentId);
    if (childComments.length === 0) return null;

    return (
      <div className={parentId ? "comment-replies" : ""}>
        {childComments.map(comment => (
          <Comment
            key={comment._id}
            comment={comment}
            replies={comments.filter(c => c.parentComment === comment._id)}
            onReplySubmit={handleCommentSubmit}
            dbUser={dbUser}
            currentUser={currentUser}
            onVote={handleVote}
            renderReplies={() => buildAndRenderComments(comment._id)}
            isExpanded={expandedComments.has(comment._id)}
            onToggleReplies={toggleReplies}
            onDelete={openDeleteModal}
          />
        ))}
      </div>
    );
  };

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className="comment-section">
      <h3>Discussion</h3>
      {currentUser && (
        <CommentForm
          onSubmit={(content) => handleCommentSubmit(content, null)}
          placeholder="Add a comment..."
        />
      )}
      <div className="comments-list">
        {comments.length > 0 ? (
          buildAndRenderComments(null)
        ) : (
          <p className="no-comments-text">No comments yet. Be the first to start the discussion!</p>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment and all its replies?"
      />
    </div>
  );
}
