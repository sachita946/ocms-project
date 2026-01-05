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

// Get a specific resource by ID
router.get('/:id', auth, getCourseResourceById);

// Update a course resource
router.put('/:id', auth, updateCourseResource);

// Delete a course resource
router.delete('/:id', auth, deleteCourseResource);

export default router;
