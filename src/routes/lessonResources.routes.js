// ============================================
// LESSON RESOURCES ROUTES
// ============================================

import express from 'express';
import * as lessonResourcesController from '../controllers/lessonResources.controller.js';
import { getSemesters, getSubjectsBySemester, getLessonsBySubject, createSemester, createSubject, createLesson } from '../controllers/adminHierarchy.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();


// Get all lesson resources (with filters)
router.get('/lesson-resources', auth, lessonResourcesController.getLessonResources);

// Get single lesson resource
router.get('/lesson-resources/:id', auth, lessonResourcesController.getLessonResourceById);

// Create lesson resource (admin only)
router.post('/lesson-resources', auth, requireRole(['ADMIN']), lessonResourcesController.createLessonResource);

// Update lesson resource (admin or owner)
router.put('/lesson-resources/:id', auth, lessonResourcesController.updateLessonResource);

// Delete lesson resource (admin or owner)
router.delete('/lesson-resources/:id', auth, lessonResourcesController.deleteLessonResource);

// ============================================
// HIERARCHY ROUTES (Students + Admin)
// ============================================

// Get all semesters (public for students)
router.get('/semesters', auth, getSemesters);

// Get subjects by semester (public for students)
router.get('/subjects', auth, getSubjectsBySemester);

// Get lessons by subject (for students to view lesson hierarchy)
router.get('/lessons', auth, getLessonsBySubject);

// Create semester
router.post('/semesters', auth, requireRole(['ADMIN']), createSemester);

// Create subject
router.post('/subjects', auth, requireRole(['ADMIN']), createSubject);

// Create lesson
router.post('/lessons', auth, requireRole(['ADMIN']), createLesson);

export default router;
