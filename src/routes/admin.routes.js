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
  getAllActivities
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require auth and ADMIN role
router.use(auth, requireRole(['ADMIN']));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/courses', getAllCourses);
router.get('/payments', getAllPayments);
router.get('/reviews', getAllReviews);
router.get('/notifications', getAllNotifications);
router.get('/activities', getAllActivities);

export default router;
