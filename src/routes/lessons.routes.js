import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getAllLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
} from '../controllers/lessons.controller.js';

const router = Router();

router.get('/', getAllLessons);
router.get('/:id', getLesson);
router.post('/', auth, requireRole(['INSTRUCTOR', 'ADMIN']), createLesson);
router.put('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), updateLesson);
router.delete('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), deleteLesson);

export default router;