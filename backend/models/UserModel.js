import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: 'default_avatar_url' },
    
    // --- NEW FIELDS FOR FRIEND SYSTEM 2.0 ---
    
    // Array to store IDs of users who are friends
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // An object to store both sent and received friend requests
    friendRequests: {
      sent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      received: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },

  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
