import { Router } from 'express';
import { auth } from '../middleware/auth.js';

import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile
} from '../controllers/profileDashboard.controller.js';

const router = Router();

// Get logged-in user's profile
router.get('/me', auth, getMyProfile);

// Update logged-in user's profile
router.put('/me', auth, updateMyProfile);

// Get profile of any user by ID
router.get('/:id', auth, getProfileByUserId); 
// If you want public access, remove auth

export default router;
