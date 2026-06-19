import mongoose from 'mongoose';

const groupSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    creator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    members: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    moderators: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    // To store important, curated content for the group
    pinnedPosts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Post' 
    }],
    groupIcon: { 
      type: String, 
      default: '' 
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);
export default Group;
