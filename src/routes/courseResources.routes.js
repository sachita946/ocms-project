import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createCourseResource,
  getCourseResources,
  getCourseResourceById,
  deleteCourseResource,
  updateCourseResource
} from '../controllers/courseResources.controller.js';

const router = Router();

// Create a new course resource (notes, questions, preboard)
router.post('/', auth, createCourseResource);

// Get course resources with filters
router.get('/', auth, getCourseResources);
router.get('/:id', auth, getCourseResourceById);
router.put('/:id', auth, updateCourseResource);
router.delete('/:id', auth, deleteCourseResource);

export default router;
