import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getMyPerformance, getPerformanceById } from '../controllers/performance.controller.js';
import { markLessonComplete, getProgressByEnrollment } from '../controllers/progress.controller.js';
const router = Router();

// student's own performance
router.get('/me', auth, getMyPerformance);

// admin or self by id
router.get('/:id', auth, getPerformanceById);
router.post('/complete', auth, markLessonComplete);           // POST /api/progress/complete
router.get('/enrollment/:enrollmentId', auth, getProgressByEnrollment); // GET /api/progress/enrollment/:id


export default router;