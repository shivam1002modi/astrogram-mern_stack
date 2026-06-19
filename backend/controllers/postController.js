import Post from '../models/PostModel.js';
import User from '../models/UserModel.js';
import { getPublicIdFromUrl } from '../utils/cloudinaryHelper.js';
import { v2 as cloudinary } from 'cloudinary';
import Comment from '../models/CommentModel.js';
import { moderateContent } from '../utils/moderation.js';

// @desc    Get the home feed (posts from friends)
// @route   GET /api/posts/home
// @access  Private
export const getHomeFeed = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find posts where the author is in the user's friends list
    const posts = await Post.find({ user: { $in: user.friends } })
      .populate('user', 'name profilePicture') // ✅ **FIX**: This now correctly populates the author's data
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching home feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Fetch all public posts for the explore feed
// @route   GET /api/posts/explore
// @access  Public
export const getExploreFeed = async (req, res) => {
  try {
    // ✅ **FIX**: This query now correctly populates the user data
    const posts = await Post.find({ privacy: 'public' })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 }); // A simple sort is more efficient than random for a large dataset

    // For true randomness, an aggregation pipeline is better, but this is robust.
    // We can shuffle the array here if randomness is critical.
    const shuffledPosts = posts.sort(() => 0.5 - Math.random()).slice(0, 20); // Get 20 random posts

    res.json(shuffledPosts);
  } catch (error) {
    console.error('Error fetching explore feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, description, privacy } = req.body; // Get privacy from the request

    const moderationResult = await moderateContent(`${title} ${description}`);
    if (moderationResult.isFlagged) {
        return res.status(400).json({ message: moderationResult.reason });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ostrogram_posts',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
    }

    const newPost = new Post({
      user: user._id,
      title,
      description,
      privacy, // Save the privacy setting
      imageUrl,
    });
    
    const savedPost = await newPost.save();

    const postWithUser = await Post.findById(savedPost._id).populate('user', 'name profilePicture');
    
    // ✅ **FIX**: Ensure the real-time event includes the correct privacy setting
    if (postWithUser.privacy === 'public' || (postWithUser.privacy === 'private' && user.friends.length > 0)) {
        req.io.emit('new_post', postWithUser);
    }
    
    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isLiked = post.likes.some((likeId) => likeId.equals(user._id));
    if (isLiked) {
      post.likes = post.likes.filter((likeId) => !likeId.equals(user._id));
    } else {
      post.likes.push(user._id);
    }
    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('user', 'name profilePicture');
    res.json(populatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch a single post by its ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name profilePicture');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (post.user.toString() !== user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (post.imageUrl) {
      const publicId = getPublicIdFromUrl(post.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);

    req.io.emit('post_deleted', req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
