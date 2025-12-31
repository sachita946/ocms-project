import { Router } from 'express';
import {auth} from '../middleware/auth.js';
import { getMyPerformance } from '../controllers/performance.controller.js';

const router = Router();

// Student performance dashboard
router.get('/my', auth, getMyPerformance);

export default router;
