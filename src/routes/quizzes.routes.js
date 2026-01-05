import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

import {
  getAllQuizzes,
  getQuiz,
  getQuizByLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitAttempt,
  getAttemptsForQuiz,
} from "../controllers/quizzes.controller.js";

const router = Router();
-

// Get all quizzes
router.get('/', auth, getAllQuizzes);
router.get('/:id' ,auth, getQuiz);
router.get('/lesson/:lessonId', auth, getQuizByLesson);
router.get('/:id/attempts', auth, requireRole(["INSTRUCTOR"]), getAttemptsForQuiz);


// Create a quiz (Instructor only)
router.post('/', auth, requireRole(["INSTRUCTOR"]), createQuiz);
router.put('/:id', auth, requireRole(["INSTRUCTOR"]), updateQuiz);
router.delete('/:id', auth, requireRole(["INSTRUCTOR"]), deleteQuiz);
router.post('/:id/submit', auth, requireRole(["STUDENT"]), submitAttempt);

export default router;
