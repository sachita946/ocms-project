// ============================================
// LESSON RESOURCES ROUTES
// ============================================

import express from 'express';
import * as lessonResourcesController from '../controllers/lessonResources.controller.js';
import { 
  getSemesters, 
  getSubjectsBySemester, 
  getLessonsBySubject, 
  createSemester, 
  createSubject, 
  createLesson,
  getCurriculumByProgram,
  getAllPrograms,
  deleteSubject,
  getSubjectResources,
  createSubjectResource,
  deleteSubjectResource
} from '../controllers/adminHierarchy.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// HIERARCHY ROUTES (Students + Admin) - Must be before /:id route

// Get all programs (public)
router.get('/programs', getAllPrograms);

// Get curriculum by program (public)
router.get('/curriculum', getCurriculumByProgram);

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

// Delete subject
router.delete('/subjects/:id', auth, requireRole(['ADMIN']), deleteSubject);

// SUBJECT RESOURCES ROUTES (for curriculum subjects)

// Get subject resources (public for students to view)
router.get('/subject-resources', getSubjectResources);

// Create subject resource (admin or instructor)
router.post('/subject-resources', auth, requireRole(['ADMIN', 'INSTRUCTOR']), createSubjectResource);

// Delete subject resource (admin or resource owner)
router.delete('/subject-resources/:id', auth, requireRole(['ADMIN', 'INSTRUCTOR']), deleteSubjectResource);

// LESSON RESOURCES ROUTES

// Get all lesson resources (with filters)
router.get('/', auth, lessonResourcesController.getLessonResources);

// Get single lesson resource
router.get('/:id', auth, lessonResourcesController.getLessonResourceById);

// Create lesson resource (instructor or admin)
router.post('/', auth, requireRole(['INSTRUCTOR', 'ADMIN']), lessonResourcesController.createLessonResource);

// Update lesson resource (admin or owner)
router.put('/:id', auth, lessonResourcesController.updateLessonResource);

// Delete lesson resource (admin or owner)
router.delete('/:id', auth, lessonResourcesController.deleteLessonResource);

export default router;
