import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { getQuizByLesson, submitAttempt } from '../controllers/quizzes.controller.js';

import {
  getAllQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitAttempt,
  getAttemptsForQuiz
} from '../controllers/quizzes.controller.js';

const router = Router();

router.get('/', getAllQuizzes);
router.get('/:id', getQuiz);
router.post('/', auth, requireRole(['INSTRUCTOR','ADMIN']), createQuiz);
router.put('/:id', auth, requireRole(['INSTRUCTOR','ADMIN']), updateQuiz);
router.delete('/:id', auth, requireRole(['INSTRUCTOR','ADMIN']), deleteQuiz);
router.get('/lesson/:lessonId', auth, getQuizByLesson); // GET /api/quizzes/lesson/:lessonId
router.post('/attempt', auth, submitAttempt);           // POST /api/quizzes/attempt

// quiz attempts
router.post('/:id/attempts', auth, submitAttempt);
router.get('/:id/attempts', auth, getAttemptsForQuiz);

export default router;