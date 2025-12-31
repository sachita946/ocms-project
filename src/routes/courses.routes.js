import { Router } from 'express';
import {auth} from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { createCourse, getAllCourses, getCourse, getInstructorCourses, updateCourse, deleteCourse } from '../controllers/courses.controller.js';

const router = Router();
router.get('/', getAllCourses);
router.get('/instructor/my-courses', auth, requireRole(['INSTRUCTOR']), getInstructorCourses);
router.get('/:id', getCourse);
router.post('/', auth, requireRole(['INSTRUCTOR', 'ADMIN']), createCourse);
router.put('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), updateCourse);
router.delete('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), deleteCourse);

export default router;
