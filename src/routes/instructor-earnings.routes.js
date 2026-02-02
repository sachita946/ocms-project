import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getInstructorEarnings,
  getEarningsByCourse,
  getAllInstructorEarnings,
  updateEarningStatus
} from '../controllers/instructor-earnings.controller.js';

const router = express.Router();

// Instructor routes
router.get('/my-earnings', auth, requireRole(['INSTRUCTOR']), getInstructorEarnings);
router.get('/my-earnings/by-course', auth, requireRole(['INSTRUCTOR']), getEarningsByCourse);

// Admin routes
router.get('/all', auth, requireRole(['ADMIN']), getAllInstructorEarnings);
router.put('/:id/status', auth, requireRole(['ADMIN']), updateEarningStatus);

// Demo routes (for development)
router.get('/demo/all', getAllInstructorEarnings);
router.put('/demo/:id/status', updateEarningStatus);

export default router;