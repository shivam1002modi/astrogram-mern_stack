import express from 'express';
import multer from 'multer';
import {
  getHomeFeed,
  getExploreFeed,
  createPost,
  getPostById,
  likeUnlikePost,
  deletePost
} from '../controllers/postController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- NEW FEED ROUTES ---
// Get the personalized home feed (friends' posts)
router.get('/home', verifyToken, getHomeFeed);
// Get the public explore feed (random public posts)
router.get('/explore', getExploreFeed);


// --- EXISTING POST ROUTES ---
// Get a single post by ID
router.get('/:id', getPostById);
// Create a new post
router.post('/', verifyToken, upload.single('image'), createPost);
// Like/unlike a post
router.put('/:id/like', verifyToken, likeUnlikePost);
// Delete a post
router.delete('/:id', verifyToken, deletePost);

export default router;

