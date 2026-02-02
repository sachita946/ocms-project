import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createCourseResource,
  getCourseResources,
  getCourseResourceById,
  deleteCourseResource,
  updateCourseResource,
  getPublicCourseResources
} from '../controllers/courseResources.controller.js';

const router = Router();

// Create a new course resource (notes, questions, preboard)
router.post('/', auth, createCourseResource);

// Get course resources with filters (authenticated)
router.get('/', auth, getCourseResources);

// Public endpoint for viewing file-based resources (notes, preboard, board)
router.get('/public', getPublicCourseResources);

router.get('/:id', auth, getCourseResourceById);
router.put('/:id',auth, updateCourseResource);
router.delete('/:id',auth, deleteCourseResource);

export default router;
