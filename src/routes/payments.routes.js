import { Router } from 'express';
import  {auth} from '../middleware/auth.js';   // ensures logged-in user
import { requireRole } from '../middleware/role.js'; // optional if admin needed
import {
  payCourse,
  getPayments,
  updatePaymentStatus
} from '../controllers/payments.controller.js';

const router = Router();

// Pay for a course (Student)
router.post('/pay', auth, payCourse);

// Get my payments (Student)
router.get('/my', auth, getPayments);

// Update payment status (Admin only)
router.patch('/:id/status', auth, requireRole('ADMIN'), updatePaymentStatus);

export default router;
