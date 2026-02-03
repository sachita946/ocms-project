import { Router } from 'express';
import  {auth} from '../middleware/auth.js';   // ensures logged-in user
import { requireRole } from '../middleware/role.js'; // optional if admin needed
import {
  createPaymentIntent,
  confirmPayment,
  failPayment,
  getPayments,
  updatePaymentStatus,
  createPayment
} from '../controllers/payments.controller.js';

const router = Router();

// Create payment record
router.post('/', auth, createPayment);

// Create payment intent for Stripe (Student)
router.post('/create-intent', auth, createPaymentIntent);

// Confirm payment after Stripe processing (Student)
router.post('/confirm', auth, confirmPayment);

// Mark payment as failed (Student)
router.post('/fail', auth, failPayment);

// Get my payments (Student)
router.get('/my', auth, getPayments);

// Update payment status (Admin only)
router.patch('/:id/status', auth, requireRole('ADMIN'), updatePaymentStatus);

export default router;
