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

// ---------------- PUBLIC ROUTES ----------------

// Get all quizzes
router.get('/', auth, getAllQuizzes); // You can decide to make this public if needed

// Get single quiz
router.get('/:id' ,auth, getQuiz);

// Get quiz by lesson
router.get('/lesson/:lessonId', auth, getQuizByLesson);

// Get all attempts for a quiz (Instructor only)
router.get('/:id/attempts', auth, requireRole(["INSTRUCTOR"]), getAttemptsForQuiz);

// ---------------- PROTECTED ROUTES ----------------

// Create a quiz (Instructor only)
router.post('/', auth, requireRole(["INSTRUCTOR"]), createQuiz);

// Update a quiz (Instructor only)
router.put('/:id', auth, requireRole(["INSTRUCTOR"]), updateQuiz);

// Delete a quiz (Instructor only)
router.delete('/:id', auth, requireRole(["INSTRUCTOR"]), deleteQuiz);

// Submit quiz attempt (Student only)
router.post('/:id/submit', auth, requireRole(["STUDENT"]), submitAttempt);

export default router;
