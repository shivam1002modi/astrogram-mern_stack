import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/authMiddleware.js';
// 1. Import the new searchUsers function
import {
  loginOrRegisterUser,
  getUserProfile,
  updateUserProfile,
  getUsersByIds,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// --- Existing Routes ---
router.post('/auth', verifyToken, loginOrRegisterUser);
router.post('/profiles', getUsersByIds); 
router.get('/profile/:id', getUserProfile);
router.put(
  '/profile',
  verifyToken,
  upload.single('profilePicture'),
  updateUserProfile
);

// --- 2. ADD THE NEW SEARCH ROUTE ---
router.get('/search', verifyToken, searchUsers);

export default router;
