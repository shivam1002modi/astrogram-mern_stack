import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    // Link to the post this comment belongs to
    post: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true, // Index for fast lookups of all comments on a post
    },
    // The user who wrote the comment
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The key to threaded replies. Null if it's a top-level comment.
    parentComment: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    // The comment content, which we'll store as Markdown text
    content: { 
      type: String,
      required: true,
    },
    // Arrays of user IDs to track votes
    upvotes: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // A status field for our AI moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // All new comments will be checked
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Important: ensures virtual fields are sent to the frontend
    toObject: { virtuals: true },
  }
);

// A "virtual" field that calculates the score without storing it.
// It's always up-to-date and efficient.
commentSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
