import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getMyPerformance } from '../controllers/performance.controller.js';

const router = Router();

router.get('/me', auth, getMyPerformance); // GET /api/performance/me

export default router;