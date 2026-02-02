import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getStats,
  getAllUsers,
  getAllCourses,
  getAllPayments,
  getAllReviews,
  getAllNotifications,
  getAllActivities,
  approveInstructor,
  rejectInstructor
} from '../controllers/admin.controller.js';

const router = Router();

// Demo routes that don't require authentication (for development)
router.get('/demo/stats', getStats);
router.get('/demo/users', getAllUsers);
router.get('/demo/courses', getAllCourses);
router.get('/demo/payments', getAllPayments);
router.get('/demo/reviews', getAllReviews);
router.get('/demo/notifications', getAllNotifications);
router.get('/demo/activities', getAllActivities);
router.put('/demo/instructors/:userId/approve', approveInstructor);
router.put('/demo/instructors/:userId/reject', rejectInstructor);

// All admin routes require auth and ADMIN role
router.use(auth, requireRole(['ADMIN']));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/courses', getAllCourses);
router.get('/payments', getAllPayments);
router.get('/reviews', getAllReviews);
router.get('/notifications', getAllNotifications);
router.get('/activities', getAllActivities);

// Instructor management
router.put('/instructors/:userId/approve', approveInstructor);
router.put('/instructors/:userId/reject', rejectInstructor);

export default router;
