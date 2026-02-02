import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  markLessonComplete,
  getProgressByEnrollment,
  getCourseProgressStats,
  getAllStudentsProgress
} from '../controllers/progress.controller.js';

const router = Router();

// Mark lesson as complete
router.post('/', auth, markLessonComplete); 

// Get progress for a specific enrollment
router.get('/:enrollmentId', auth, getProgressByEnrollment);

// Get progress stats for a course (instructor view)
router.get('/course/:courseId/stats', auth, getCourseProgressStats); 

// Get all students progress (admin view)
router.get('/all-students', auth, getAllStudentsProgress);

// Demo routes (for development)
router.get('/demo/all-students', getAllStudentsProgress);

export default router;