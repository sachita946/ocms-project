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
router.post('/', auth, markLessonComplete); // POST /api/progress

// Get progress for a specific enrollment
router.get('/:enrollmentId', auth, getProgressByEnrollment); // GET /api/progress/:enrollmentId

// Get progress stats for a course (instructor view)
router.get('/course/:courseId/stats', auth, getCourseProgressStats); // GET /api/progress/course/:courseId/stats

// Get all students progress (admin view)
router.get('/all-students', auth, getAllStudentsProgress); // GET /api/progress/all-students

export default router;