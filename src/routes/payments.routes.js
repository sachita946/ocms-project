import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPayments,
  getPayment,
  createPayment,
  updatePaymentStatus
} from '../controllers/payments.controller.js';

const router = Router();

router.get('/', auth, getPayments);
router.get('/:id', auth, getPayment);
router.post('/', auth, createPayment);
router.put('/:id/status', auth, updatePaymentStatus);

export default router;