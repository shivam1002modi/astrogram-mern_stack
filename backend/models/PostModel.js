import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // --- NEW FIELDS FOR SOCIAL GRAPH ---

    // To control visibility (public for Explore feed, private for friends-only)
    privacy: { 
      type: String, 
      enum: ['public', 'private'], 
      default: 'public' 
    },

    // To categorize content and power the Explore feed
    hashtags: [{ type: String }],

    // Optional: To associate a post with a specific group/community
    group: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Group', 
      default: null 
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
