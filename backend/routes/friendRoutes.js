import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests
} from '../controllers/friendController.js';

const router = express.Router();

// Get the logged-in user's friends list
router.get('/', verifyToken, getFriends);

// Get pending friend requests for the logged-in user
router.get('/requests', verifyToken, getFriendRequests);

// Send a friend request to a user
router.post('/send/:userId', verifyToken, sendFriendRequest);

// Accept a friend request
router.put('/accept/:userId', verifyToken, acceptFriendRequest);

// Decline or cancel a friend request
router.put('/decline/:userId', verifyToken, declineFriendRequest);

// Remove a friend
router.delete('/remove/:userId', verifyToken, removeFriend);

export default router;
