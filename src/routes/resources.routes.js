import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getAllResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resources.controller.js';

const router = Router();

router.get('/', getAllResources);
router.get('/:id', getResource);
router.post('/', auth, requireRole(['INSTRUCTOR', 'ADMIN']), createResource);
router.put('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), updateResource);
router.delete('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), deleteResource);

export default router;