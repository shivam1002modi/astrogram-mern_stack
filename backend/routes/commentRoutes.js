import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createComment,
  getCommentsForPost,
  voteOnComment,
  deleteComment, // 1. Import deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/post/:postId', getCommentsForPost);
router.post('/', verifyToken, createComment);
router.put('/:id/vote', verifyToken, voteOnComment);
router.delete('/:id', verifyToken, deleteComment); // 2. Add the new DELETE route

export default router;
