import { Router } from 'express';
import {auth} from '../middleware/auth.js';
import { getAllLessons, createLesson, getLessonsByCourse, getLesson, updateLesson, deleteLesson } from '../controllers/lessons.controller.js';

const router = Router();
router.get('/', getAllLessons);
router.post('/', auth, createLesson);
router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLesson);
router.put('/:id', auth, updateLesson);
router.delete('/:id', auth, deleteLesson);

export default router;
