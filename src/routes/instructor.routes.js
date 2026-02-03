import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getInstructorStudents,
  getInstructorQuizzes,
  getInstructorProfile,
  updateInstructorProfile,
  getStudentProgress
} from '../controllers/instructor.controller.js';

const router = Router();

// Get all students enrolled in instructor's courses
router.get('/students', auth, requireRole(['INSTRUCTOR']), getInstructorStudents);

// Get all quizzes created by instructor
router.get('/quizzes', auth, requireRole(['INSTRUCTOR']), getInstructorQuizzes);

// Get instructor profile
router.get('/profile', auth, requireRole(['INSTRUCTOR']), getInstructorProfile);

// Update instructor profile
router.put('/profile', auth, requireRole(['INSTRUCTOR']), updateInstructorProfile);

// Get student progress for instructor's courses
router.get('/student-progress', auth, requireRole(['INSTRUCTOR']), getStudentProgress);

export default router;