import { Router } from 'express';
import { forgotPassword, resetPassword } from '../controllers/password.controller.js';

const router = Router();

router.post('/forgot', forgotPassword);   // POST /api/password/forgot
router.post('/reset', resetPassword);     // POST /api/password/reset

export default router;