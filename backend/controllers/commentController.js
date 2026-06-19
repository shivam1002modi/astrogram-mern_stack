import Comment from '../models/CommentModel.js';
import User from '../models/UserModel.js';
import { moderateContent } from '../utils/moderation.js';

// @desc    Create a new comment or reply
export const createComment = async (req, res) => {
  const { postId, content, parentCommentId } = req.body;
  try {
    const moderationResult = await moderateContent(content);
    if (moderationResult.isFlagged) {
      return res.status(400).json({ message: moderationResult.reason });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = new Comment({
      post: postId,
      user: user._id,
      content,
      parentComment: parentCommentId || null,
      status: 'approved',
    });

    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate('user', 'name profilePicture');
    res.status(201).json(populatedComment);
    
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ... other functions (getCommentsForPost, voteOnComment, deleteComment) ...
export const getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      status: 'approved',
    })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: 'asc' });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const voteOnComment = async (req, res) => {
  const { voteType } = req.body;

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user._id.toString();

    const upvoteIndex = comment.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    const downvoteIndex = comment.downvotes.findIndex(
      (id) => id.toString() === userId
    );

    if (voteType === 'upvote') {
      if (upvoteIndex !== -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      } else {
        comment.upvotes.push(userId);
        if (downvoteIndex !== -1) {
          comment.downvotes.splice(downvoteIndex, 1);
        }
      }
    } else if (voteType === 'downvote') {
      if (downvoteIndex !== -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      } else {
        comment.downvotes.push(userId);
        if (upvoteIndex !== -1) {
          comment.upvotes.splice(upvoteIndex, 1);
        }
      }
    }

    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(updatedComment._id).populate('user', 'name profilePicture');
    res.json(populatedComment);
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteCommentAndChildren = async (commentId) => {
    const children = await Comment.find({ parentComment: commentId });
    for (const child of children) {
        await deleteCommentAndChildren(child._id);
    }
    await Comment.findByIdAndDelete(commentId);
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (comment.user.toString() !== user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await deleteCommentAndChildren(req.params.id);

        res.json({ message: 'Comment and replies removed' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
