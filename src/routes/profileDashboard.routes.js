import express from 'express';
import {
  getStudentProfile, updateStudentProfile, getStudentDashboard,
  getInstructorProfile, updateInstructorProfile, getInstructorDashboard
} from '../controllers/profileDashboard.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

/* Student */
router.get('/student/me', getStudentProfile);
router.put('/student/me', updateStudentProfile);
router.get('/student/dashboard', getStudentDashboard);

/* Instructor */
router.get('/instructor/me', getInstructorProfile);
router.put('/instructor/me', updateInstructorProfile);
router.get('/instructor/dashboard', getInstructorDashboard);

export default router;
