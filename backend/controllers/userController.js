import User from '../models/UserModel.js';
import Post from '../models/PostModel.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Authenticate or register user
// @route   POST /api/users/auth
// @access  Private
export const loginOrRegisterUser = async (req, res) => {
  const { name, email } = req.user;
  try {
    let user = await User.findOne({ email });

    if (user) {
      res.json(user);
    } else {
      const newUser = new User({
        firebaseUid: req.user.uid,
        name,
        email,
      });
      const createdUser = await newUser.save();
      res.status(201).json(createdUser);
    }
  } catch (error) {
    console.error('Error in loginOrRegisterUser:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile and their posts
// @route   GET /api/users/profile/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // ✅ **FIX**: This now correctly populates the author data for each post.
    const posts = await Post.find({ user: user._id })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get multiple user profiles from an array of IDs
// @route   POST /api/users/profiles
// @access  Public
export const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'User IDs must be provided in an array.' });
    }
    const users = await User.find({ '_id': { $in: ids } }).select('name profilePicture');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update the logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ostrogram_avatars',
        resource_type: 'image',
        gravity: 'face',
        crop: 'thumb',
        width: 200,
        height: 200,
      });
      user.profilePicture = result.secure_url;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search for users by name
// @route   GET /api/users/search?q=query
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q ? { name: { $regex: req.query.q, $options: 'i' } } : {};
    const currentUser = await User.findOne({ firebaseUid: req.user.uid });
    const users = await User.find({ ...searchQuery, _id: { $ne: currentUser._id } })
      .select('name profilePicture flair')
      .limit(10); 
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
